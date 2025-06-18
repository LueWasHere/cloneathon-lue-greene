import sqlite3
import os
try:
    import utils.master_logger as master_logger
except ImportError:
    import master_logger
import os
import dotenv

dotenv.load_dotenv()
USERS_DB_PATH = os.getenv("USERS_DB_PATH")
MODELS_DB_PATH = os.getenv("MODELS_DB_PATH")
CHATS_DB_PATH = os.getenv("CHATS_DB_PATH")

# --- Setup Master Logger ---
MASTER_LOGGER = master_logger.MasterLogger(__file__)

# --- Main Script Logic ---
def setup_database(SQL_SCRIPT_NAME: str, DATABASE_NAME: str, DB_DIR: str='db', verbose: bool=False) -> None:
    """
    Sets up a database by creating the necessary directory and
    executing the SQL script.
    """
    # Check if the required SQL script exists first
    if not os.path.exists(SQL_SCRIPT_NAME):
        MASTER_LOGGER.critical(f"FATAL ERROR: SQL script '{SQL_SCRIPT_NAME}' not found.")
        MASTER_LOGGER.critical("Please make sure the script is in the same directory as this Python file.")
        return # Exit the function

    # 1. Ensure the database directory exists
    MASTER_LOGGER.conditional_log(f"Ensuring database directory '{DB_DIR}' exists...", verbose, "debug")
    os.makedirs(DB_DIR, exist_ok=True)
    MASTER_LOGGER.conditional_log(f"Directory '{DB_DIR}' is ready.", verbose, "debug")

    # Construct the full path to the database
    db_path = os.path.join(DB_DIR, DATABASE_NAME)
    
    conn = None # Initialize connection to None
    try:
        # 2. Read the SQL commands from the file
        MASTER_LOGGER.conditional_log(f"Reading SQL commands from '{SQL_SCRIPT_NAME}'...", verbose, "debug")
        with open(SQL_SCRIPT_NAME, 'r') as sql_file:
            sql_script = sql_file.read()
        MASTER_LOGGER.info("SQL script loaded.")
        
        # 3. Connect to the SQLite database (this will create it if it doesn't exist)
        MASTER_LOGGER.conditional_log(f"Connecting to database at '{db_path}'...", verbose, "debug")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        MASTER_LOGGER.conditional_log("Connection successful.", verbose, "debug")
        
        # 4. Execute the entire SQL script
        # executescript() is used because the file may contain multiple SQL statements.
        MASTER_LOGGER.info("Executing SQL script to create tables...")
        cursor.executescript(sql_script)
        
        # 5. Commit the changes and close the connection
        conn.commit()
        MASTER_LOGGER.info("SUCCESS: Database tables created and changes committed.")
        
    except sqlite3.Error as e:
        MASTER_LOGGER.error(f"DATABASE ERROR: An error occurred - {e}")
        
    finally:
        # 6. Ensure the connection is closed even if an error occurred
        if conn:
            conn.close()
            MASTER_LOGGER.conditional_log("Database connection closed.", verbose, "debug")

def check_db_exists(DB_PATH: str) -> bool:
    """Checks if a database file exists."""
    if not os.path.exists(DB_PATH):
        return False
    return True

def get_db_conn(DB_PATH: str):
    """Establishes a connection to the user SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- Specific Queries ---
def getUserWithIDQuery(user_id):
    user_data = []
    try:
        conn = get_db_conn(USERS_DB_PATH)
        user_data = conn.execute(
            'SELECT * FROM user_accounts WHERE user_id = ?', (user_id,)
        ).fetchone()
    except Exception as e:
        pass
    finally:
        conn.close()

    return user_data

def getUserWithEmailQuery(email):
    user_data = []
    try:
        conn = get_db_conn(USERS_DB_PATH)
        user_data = conn.execute(
            'SELECT * FROM user_accounts WHERE email = ?', (email,)
        ).fetchone()
    except Exception as e:
        pass
    finally:
        conn.close()

    return user_data

def getUserChatsWithIDQuery(user_id):
    user_chats = []
    try:
        conn = get_db_conn(CHATS_DB_PATH)
        user_chats = conn.execute(
            "SELECT chat_id, title, created_at, is_pinned FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC;", (user_id,)
        ).fetchall()
        conn.close()
    except Exception as e:
        pass
    finally:
        conn.close()

    return user_chats

def getChatMessagesWithIDQuery(chat_id):
    user_chats = []
    
    try:
        conn = get_db_conn(CHATS_DB_PATH)
        user_chats = conn.execute(
            "SELECT message_id, sender, created_at, content, llm_name FROM chat_messages WHERE chat_id = ? ORDER BY created_at DESC;", (chat_id,)
        ).fetchall()
    except Exception as e:
        pass
    finally:
        conn.close()

    return user_chats

def getChatUserIdQUery(chat_id):
    user_id = None
    try:
        conn = get_db_conn(CHATS_DB_PATH)
        user_id = conn.execute(
            "SELECT user_id FROM chat_sessions WHERE chat_id = ?;", (chat_id,)
        )
        row = user_id.fetchone()
    except Exception as e:
        pass
    finally:
        conn.close()

    # Now, check if the 'row' variable contains anything
    if row:
        # If it's not None, return the first item from the tuple
        return row[0] 
    else:
        # If it is None, it means no record was found, so return None
        return None

def makeUserAccount(new_user_id, email, name, hashed_password):
    try:
        conn = get_db_conn(USERS_DB_PATH)
        
        conn.execute(
            '''INSERT INTO user_accounts (user_id, email, name, hashed_password)
                VALUES (?, ?, ?, ?)''',
            (new_user_id, email, name, hashed_password)
        )
        conn.commit()
    except Exception as e:
        pass
    finally:
        conn.close()
    
    return

def makeChat(user_id, chat_id):
    try:
        conn = get_db_conn(CHATS_DB_PATH)
        
        conn.execute(
            '''INSERT INTO chat_sessions (user_id, chat_id, title)
                VALUES (?, ?, "New Thread")''',
            (user_id, chat_id)
        )
        conn.commit()
    except Exception as e:
        pass
    finally:
        conn.close()
    
    return

def addMessageToChat(chat_id, message_id, content, sender, llm_model=None):
    try:
        conn = get_db_conn(CHATS_DB_PATH)
        
        if llm_model is None:
            conn.execute(
                '''INSERT INTO chat_messages (message_id, chat_id, content, sender) 
                    VALUES (?, ?, ?, ?);''',
                (message_id, chat_id, content, sender)
            )
        else:
            conn.execute(
                '''INSERT INTO chat_messages (message_id, chat_id, content, sender, llm_name) 
                    VALUES (?, ?, ?, ?, ?);''',
                (message_id, chat_id, content, sender, llm_model)
            )
        conn.commit()
    except Exception as e:
        pass
    finally:
        conn.close()
    
    return

# --- Script Command Line Tool ---
if __name__ == '__main__':
    import argparse

    print(os.getenv("APIKEYS_DB_PATH"))

    # Create the parser
    parser = argparse.ArgumentParser(
        description="db_manager command line tool.", 
        epilog=
        """
        NOTE: ran.man (file)
        The ran.man file is a file created by the program to keep track of already ran scripts to prevent them from being ran again
        this is meant to prevent accidental reinsertion of data or deletion of tables/databases/etc.
        See \"--forceRun\" and \"--noranMan\" for info on forcing scripts or disabling the usage of a ran.man file.      
        """
    )

    # Add arguments
    parser.add_argument('--databaseDirectory', type=str, required=True, help="The directory containing .db files and .sql files to be ran/edited.")
    
    # Group for running scripts.
    run_group = parser.add_mutually_exclusive_group(required=True)
    run_group.add_argument('--runSingle', type=str, help="Specify the name of a single script to run.")
    run_group.add_argument('--runAll', action='store_true', help="Specify that all scripts must be ran.")

    # Detecting already ran scripts
    parser.add_argument('--forceRun', action='store_true', help="Run the scripts specified regardless of a \"ran.man\" file.")
    parser.add_argument('--noWriteRanMan', action='store_true', help="Prevents the program from writing to a \"ran.man\" file.")

    # Verbose output
    parser.add_argument('--verbose', action='store_true', help="Enable verbose output.")

    # Parse the arguments
    args = parser.parse_args()

    # Variable that stores the scripts to be ran
    scripts: list[str] = []

    # Gather related ran.man info
    ranMan = []
    try:
        with open(os.path.join(args.databaseDirectory, "ran.man"), "r") as ranManFile:
            ranMan = ranManFile.read()

        ranMan = ranMan.split('\n')
    except FileNotFoundError:
        pass

    MASTER_LOGGER.info(f"Ignoring the following scripts (ran.man): {', '.join(ranMan)}")

    # Execute flagged scripts
    if args.runAll:
        # Autodetect SQL scripts
        MASTER_LOGGER.conditional_log("Autodetecting scripts...", args.verbose, 'debug')
        for file in os.listdir(args.databaseDirectory):
            if file.endswith('.sql'):
                scripts.append(os.path.join(args.databaseDirectory, file))

        MASTER_LOGGER.info(f"Detected scripts: {', '.join(scripts)}")
    else:
        scripts.append(args.runSingle)

    with open(os.path.join(args.databaseDirectory, "ran.man"), "a") as ranManFile:
        for script in scripts:
            # Getting a name for the database assuming the
            # script name follows the structure "create_NAME_db.sql"
            scriptName: str = script
            if not args.noWriteRanMan and scriptName not in ranMan:
                ranManFile.write(f"{scriptName}\n")

            if (not scriptName in ranMan) or args.forceRun:
                databaseName = scriptName.split('_')[1] + '.db'

                MASTER_LOGGER.info(f"Running {scriptName}...")
                MASTER_LOGGER.debug(f"Database name assumed to be \"{databaseName}\"")

                setup_database(scriptName, databaseName, args.databaseDirectory, args.verbose)
            else: # If the script is in the ranMan list then we don't run it
                MASTER_LOGGER.info(f"Skipping {scriptName} (ran.man)...")