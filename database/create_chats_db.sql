-- Table: chat_sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    chat_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT,
    created_at TIMESTAMP DEFAULT (datetime('now','localtime')),
    is_pinned BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- POP SINGLE EXAMPLE, REMOVE ME LATER
INSERT INTO chat_sessions (chat_id, user_id, title) VALUES ("712edee1-9887-48f3-929f-4644e0eb1c73", "0ae21996-bb47-4d96-894a-feba9743ad45", "Example Chat");

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id UUID PRIMARY KEY,
    chat_id UUID NOT NULL,
    sender TEXT CHECK(sender IN ('user', 'llm')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT (datetime('now','localtime')),
    llm_name TEXT DEFAULT NULL,
    FOREIGN KEY (chat_id) REFERENCES chat_sessions(chat_id) ON DELETE CASCADE,
    CHECK (
        (sender = 'llm' AND llm_name IS NOT NULL) OR
        (sender = 'user' AND llm_name IS NULL)
    )
);

-- POP SINGLE EXAMPLE, REMOVE ME LATER
INSERT INTO chat_messages (message_id, chat_id, content, sender) VALUES ("712edee1-9887-48f3-929f-4644e0eb1c74", "712edee1-9887-48f3-929f-4644e0eb1c73", "Why are you gae?", "user");
INSERT INTO chat_messages (message_id, chat_id, content, sender, llm_name) VALUES ("712edee1-9887-48f3-929f-4644e0eb1c77", "712edee1-9887-48f3-929f-4644e0eb1c73", "Who says I am gae?", "llm", "Claude Opus 4");
