PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_accounts (
    user_id UUID PRIMARY KEY, -- Using INTEGER PRIMARY KEY is often more efficient for joins in SQLite
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    -- Foreign key to the subscription_plans table
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
    timezone TEXT,
    balance_usd REAL NOT NULL DEFAULT 2.00,
    current_session_id UUID DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS user_api_keys (
    -- Add a proper primary key to uniquely identify each key
    api_key_id UUID PRIMARY KEY,
    -- The key itself should be unique across all users
    api_key TEXT UNIQUE NOT NULL,
    -- Use the more explicit and standard FOREIGN KEY syntax
    user_id UUID NOT NULL,
    model_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1, -- Useful for disabling keys without deleting them
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
    is_admin_key BOOLEAN NOT NULL DEFAULT 0,
    -- If a user is deleted, their keys will be automatically deleted too.
    FOREIGN KEY(user_id) REFERENCES user_accounts(user_id) ON DELETE CASCADE
);