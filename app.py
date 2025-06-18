# --- Flask Imports ---
from flask import Flask, render_template, request, jsonify, url_for, abort, redirect, Response
from flask_login import LoginManager, login_required, current_user
from werkzeug.exceptions import HTTPException
# --- Local Imports ---
import utils.database_manager as db_manager
import utils.master_logger as master_logger
import utils.ai_client as ai_client
import utils.storage as storage
# --- Other Imports ---
import os
import dotenv
from datetime import timedelta, datetime
import traceback
import uuid
import time
import threading

# --- Flask App ---
app = Flask(__name__)
login_manager = LoginManager()

# --- Special Verbose Information ---
@app.before_request
def log_request_info():
    if app.debug or args.verbose: # Check if verbose logging is enabled
        user_info = f"user='{current_user.id}'" if current_user.is_authenticated else "user='Anonymous'"
        app.logger.debug(f"Request: {request.method} {request.path} [{user_info}]")

# --- HTTP Error Handlers ---
@app.errorhandler(401)
def unauthorized(e):
    app.logger.info(f"Unauthorized (401) access attempt to {request.path}")
    return redirect(url_for("unauthorized_page"))

@app.errorhandler(403)
def forbidden(e):
    app.logger.warning(f"Forbidden (403) access attempt by user {current_user.id if current_user.is_authenticated else 'Anonymous'} to {request.path}")
    return redirect(url_for("forbidden_page"))

@app.errorhandler(404)
def page_not_found(e):
    app.logger.info(f"Not Found (404): {request.path}")
    return redirect(url_for("page_not_found_page"))

@app.errorhandler(Exception)
def handle_exception(e):
    return redirect(url_for("handle_exception_page", error=e))

# --- HTTP Error Pages ---
@app.route('/unauthorized')
def unauthorized_page():
    return render_template('401.html'), 401

@app.route('/forbidden')
def forbidden_page():
    return render_template('403.html'), 403

@app.route('/page-not-found')
def page_not_found_page():
    return render_template('404.html'), 404

@app.route('/general-error')
def handle_exception_page(error=None):
    # This is a true internal server error.
    # We log the full traceback for debugging.
    if error is not None:
        error_traceback = traceback.format_exc()
    
        # Use Flask's built-in logger to record the error
        app.logger.error(
            f"Unhandled Exception: {error}\n"
            f"Traceback:\n{error_traceback}"
        )

        # For security reasons, don't show the traceback to the user in production.
        # Only show a generic message.
        # We can, however, show it during development (debug mode).
        tb_display = error_traceback if app.debug else ""
    
        return render_template(
            'error.html', 
            error_code=500, 
            message="An unexpected internal error occurred.",
            traceback=tb_display  # Pass traceback to template (will be empty in prod)
        ), 500
    else:
        return render_template(
            'error.html', 
            error_code=200, 
            message="You just wanted to see what this looked like, didn't you? ;)",
            traceback=''  # Pass traceback to template (will be empty in prod)
        ), 200

# --- API routes ---
@login_required
@app.route('/api/fetch_chats', methods=['GET'])
def fetch_chats_api():
    if current_user.is_authenticated:
        user_id = current_user.id
    else:
        abort(401)

    threads = db_manager.getUserChatsWithIDQuery(user_id)

    chats = []
    for thread in threads:
        chat_id, title, created_at, is_pinned = thread
        chats.append({"chat_id": chat_id, "title": title, "created_at": created_at, "is_pinned": is_pinned})

    #chats = chats[::-1] # Reverse array so it is ordered with newest at the beggining

    return jsonify({
        "data": chats
    }), 200 # 200 OK status code

@login_required
@app.route('/api/send_to_ai', methods=['GET', 'POST'])
def send_to_ai():
    def wait_to_commit(strg: storage.storage, new_chat_id: str):
        while not strg.ready:
            time.sleep(0.1)

        new_message_id = str(uuid.uuid4())
        db_manager.addMessageToChat(new_chat_id, new_message_id, strg.storage, "llm", "hlp")
    
    if current_user.is_authenticated:
        if not request.is_json:
            # Return an error response if the content type is not JSON\
            MASTER_LOGGER.error(f"Invalid json: {request.get_data()}")
            error_response = {'error': 'Invalid content type, must be application/json'}
            return jsonify(error_response), 415 # 415 is 'Unsupported Media Type'
        
        new_chat_info = request.get_json()
        new_chat_id = new_chat_info["chat_id"]
        
        db_manager.makeChat(current_user.id, new_chat_id)
        new_message_id = str(uuid.uuid4())
        
        db_manager.addMessageToChat(new_chat_id, new_message_id, new_chat_info["content"], "user")
        
        client_ai = ai_client.openai.OpenAI(
          api_key=ai_client.selected_provider["key"],
          base_url=ai_client.selected_provider["url"],
        )
        
        new_strg = storage.storage()
        wtc_thread = threading.Thread(target=wait_to_commit, args=(new_strg, new_chat_id,))

        wtc_thread.start()

        return Response(ai_client.send_with_client(client_ai, new_chat_id, new_chat_info["content"], new_strg), mimetype='text/plain')
    else:
        abort(401)

@login_required
@app.route('/api/create_chat', methods=['GET', 'POST'])
def create_chat():
    if current_user.is_authenticated:
        if not request.is_json:
            # Return an error response if the content type is not JSON\
            MASTER_LOGGER.error(f"Invalid json: {request.get_data()}")
            error_response = {'error': 'Invalid content type, must be application/json'}
            return jsonify(error_response), 415 # 415 is 'Unsupported Media Type'
        
        new_chat_info = request.get_json()
        db_manager.makeChat(current_user.id, new_chat_info.get("id"))
    else:
        abort(401)

    return jsonify({  }), 200 # 200 OK status code

"""@login_required
@app.route('/api/add_message_to_chat', methods=['GET', 'POST'])
def add_message_to_chat():
    if current_user.is_authenticated:
        if not request.is_json:
            # Return an error response if the content type is not JSON\
            MASTER_LOGGER.error(f"Invalid json: {request.get_data()}")
            error_response = {'error': 'Invalid content type, must be application/json'}
            return jsonify(error_response), 415 # 415 is 'Unsupported Media Type'
        
        new_message_info = request.get_json()

        id_d = db_manager.getChatUserIdQUery(new_message_info.get("thread_id"))
        MASTER_LOGGER.info(f"Proper id: {id_d}")
        if not current_user.id == id_d:
            abort(403)
        
        db_manager.addMessageToChat(new_message_info.get("thread_id"), new_message_info.get("id"), new_message_info.get("content"), new_message_info.get("sender"), new_message_info.get("model_used"))
    else:
        abort(401)

    return jsonify({  }), 200 # 200 OK status code

@login_required
@app.route('/api/set_chat_title', methods=['GET', 'POST'])
def set_chat_title():
    if current_user.is_authenticated:
        if not request.is_json:
            # Return an error response if the content type is not JSON\
            MASTER_LOGGER.error(f"Invalid json: {request.get_data()}")
            error_response = {'error': 'Invalid content type, must be application/json'}
            return jsonify(error_response), 415 # 415 is 'Unsupported Media Type'
        
        new_title = request.get_json()
        #if not current_user.id == db_manager.getChatUserIdQUery(current_user.id):
        #    return url_for('forbidden'), 403
    else:
        abort(401)

    return jsonify({  }), 200 # 200 OK status code"""

@login_required
@app.route('/api/fetch_messages', methods=['GET', 'POST'])
def fetch_messages_api():
    if current_user.is_authenticated:
        if not request.is_json:
            # Return an error response if the content type is not JSON\
            MASTER_LOGGER.error(f"Invalid json: {request.get_data()}")
            error_response = {'error': 'Invalid content type, must be application/json'}
            return jsonify(error_response), 415 # 415 is 'Unsupported Media Type'
        
        message_id = request.get_json()
    else:
        abort(401)

    thread_messages = db_manager.getChatMessagesWithIDQuery(message_id)

    messages = []
    for message in thread_messages:
        message_id, sender, created_at, content, llm_name = message
        messages.append({"message_id": message_id, "sender": sender, "created_at": created_at, "content": content, "llm_name": llm_name})

    messages = messages[::-1]

    return jsonify({
        "data": messages
    }), 200 # 200 OK status code

# --- App routes ---
@login_manager.user_loader
def load_user(user_id):
    # user_id is a string from the session, convert it to an integer
    return User.get(user_id)

@app.route('/')
@login_required
def index():
    return render_template('index.html', current_user_name=current_user.name)

# --- App Startup ---
if __name__ == '__main__':
    import argparse

    # --- Argument Parsing ---
    # Create the parser
    parser = argparse.ArgumentParser(description="Flask server.")

    parser.add_argument('--production', action='store_true', help="Specify that the program should be ran in production mode.")
    parser.add_argument('--port', type=int, required=True, help="The port the program should accept web traffic through")
    parser.add_argument('--flaskDebug', action='store_true', help="Specify that the flask server should operate in debug mode.")
    parser.add_argument('--verbose', action='store_true', help="Specify that the flask server should log verbose data.")
    parser.add_argument('--daysForCookieDuration', metavar="DAYS", type=int, help="The number of days a cookie should be stored for.")
    
    # Parse the arguments
    args = parser.parse_args()

    # --- Setup Master Logger ---
    MASTER_LOGGER = master_logger.MasterLogger(__file__)
    MASTER_LOGGER.info("--- T3 Chat Startup ---")
    MASTER_LOGGER.conditional_log("Master logger created.", args.verbose, "debug")

    app.logger.handlers = MASTER_LOGGER.logger.handlers
    app.logger.setLevel(MASTER_LOGGER.logger.level)

    # --- Flask App Initialization ---
    app.config['SECRET_KEY'] = os.urandom(24)
    MASTER_LOGGER.conditional_log(f"App secret key: {app.config['SECRET_KEY']}.", args.verbose, "debug")
    app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=30)
    app.config['GOOGLE_OAUTH_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
    app.config['GOOGLE_OAUTH_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')

    # --- Authentication Setup (Flask-Login & Google OAuth) ---
    from auth import auth as auth_blueprint, User
    app.register_blueprint(auth_blueprint)

    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    # --- Load ENV ---
    env = dict(dotenv.dotenv_values())
    MASTER_LOGGER.conditional_log(f"Loaded env: {env}", args.verbose, "debug")
    
    if env is None:
        MASTER_LOGGER.error("ENV file is missing or removed, this is required for proper functioning.")
        exit(1)

    for key, value in env.items():
        if value is None:
            MASTER_LOGGER.warn(f"ENV value {key} is not set, this may cause errors. Please set this value and rerun this program.")
        else:
            MASTER_LOGGER.conditional_log(f"ENV ({key}): {value}", args.verbose, "debug")

    db_exists_result = 0b00
    db_exists_result += 0b10 if not db_manager.check_db_exists(env["MODELS_DB_PATH"]) else 0
    db_exists_result += 0b01 if not db_manager.check_db_exists(env["USERS_DB_PATH"]) else 0

    if db_exists_result != 0b000:
        MASTER_LOGGER.critical(f"1 OR MORE DATABASES IS MISSING. ERROR CODE: {db_exists_result}") # TODO: Make this error message better
        exit(1)
    
    host_str = '0.0.0.0' if args.production else '127.0.0.1'
    MASTER_LOGGER.conditional_log(f"Hosting on: {host_str} ({'local' if host_str == '127.0.0.1' else 'global'})", args.verbose, "debug")
    app.run(debug=args.flaskDebug, host=host_str, port=args.port)