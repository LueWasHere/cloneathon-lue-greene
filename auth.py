import uuid
from flask import Blueprint, render_template, request, flash, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
import sqlite3
import os
from datetime import datetime
import utils.master_logger as master_logger

# Import the database manager
import utils.database_manager as db_manager

# --- Setup Master Logger ---
MASTER_LOGGER = master_logger.MasterLogger(__file__)

# --- Database Configuration ---
DB_DIR = 'db'
USER_DB_PATH = os.path.join(DB_DIR, 'user.db')

# --- User Model for Flask-Login ---
class User(UserMixin):
    def __init__(self, id, email, name):
        self.id = id
        self.email = email
        self.name = name

    @staticmethod
    def get(user_id):
        user_data = db_manager.getUserWithIDQuery(user_id)
        if not user_data:
            MASTER_LOGGER.warn(f"User.get failed to find user with ID: {user_id}. Invalid session cookie.")
            return None
        
        user = User(
            id=user_data['user_id'], 
            email=user_data['email'], 
            name=user_data['name'],
        )
        return user

# --- Auth Blueprint ---
auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        MASTER_LOGGER.info(f"Login attempt for email: '{email}'")

        user_data = db_manager.getUserWithEmailQuery(email)
        
        if not user_data or not check_password_hash(user_data['hashed_password'], password):
            MASTER_LOGGER.warn(f"Failed login attempt for email: '{email}'. Reason: Invalid credentials.")
            flash('Please check your login details and try again.', 'error')
            return redirect(url_for('auth.login'))
        
        user_obj = User.get(user_data['user_id'])
        login_user(user_obj, remember=True)

        MASTER_LOGGER.info(f"User '{email}' (ID: {user_obj.id}) logged in successfully.")
        
        return redirect(url_for('index'))
        
    return render_template('login.html')

@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        ### TODO: Add checks for if passwords are returned as None ###
        password = request.form.get('password') 
        password2 = request.form.get('password2') # Get the second password

        MASTER_LOGGER.info(f"Signup attempt for email: '{email}', name: '{name}'")

        if password != password2:
            MASTER_LOGGER.warn(f"Signup failed for '{email}': Passwords do not match.")
            flash('Passwords do not match.', 'error')
            return redirect(url_for('auth.signup'))

        if len(password) < 8:
            MASTER_LOGGER.warn(f"Signup failed for '{email}': Password too short.")
            flash('Password must be at least 8 characters long.', 'error')
            return redirect(url_for('auth.signup'))

        user_data = db_manager.getUserWithEmailQuery(email)
        
        if user_data:
            MASTER_LOGGER.warn(f"Signup failed for '{email}': Email already exists.")
            flash('Email address already exists.', 'error')
            return redirect(url_for('auth.signup'))
        
        new_user_id = str(uuid.uuid4())
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        db_manager.makeUserAccount(new_user_id, email, name, hashed_password)

        MASTER_LOGGER.info(f"New user created successfully. Email: '{email}', Name: '{name}', ID: {new_user_id}")

        user_obj = User.get(new_user_id)
        login_user(user_obj, remember=True)
        return redirect(url_for('index'))

    return render_template('signup.html')

@auth.route('/logout')
@login_required
def logout():
    MASTER_LOGGER.info(f"User '{current_user.email}' (ID: {current_user.id}) logging out.")
    logout_user()
    return redirect(url_for('auth.login'))