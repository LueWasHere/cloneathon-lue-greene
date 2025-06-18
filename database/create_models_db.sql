-- ##################################################
-- ############## DATABASE SCHEMA SETUP #############
-- ##################################################

-- Drop tables if they exist to ensure a fresh start
DROP TABLE IF EXISTS llm_models;
DROP TABLE IF EXISTS image_models;
DROP TABLE IF EXISTS audio_models;
DROP TABLE IF EXISTS video_models;

-- Create the table for Language and Multimodal Models (LLMs)
CREATE TABLE llm_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    api_name VARCHAR(255),
    context_window_max_tokens INT,
    supports_images_input BOOLEAN DEFAULT FALSE,
    supports_pdfs_input BOOLEAN DEFAULT FALSE,
    multimodal_input BOOLEAN DEFAULT FALSE,
    reasoning_enabled BOOLEAN DEFAULT TRUE,
    usd_per_million_input_tokens DECIMAL(10, 5),
    usd_per_million_output_tokens DECIMAL(10, 5),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Create the table for Image Generation Models
CREATE TABLE image_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    api_name VARCHAR(255),
    context_window_max_tokens INT,
    supports_images_input BOOLEAN DEFAULT FALSE,
    supports_pdfs_input BOOLEAN DEFAULT FALSE,
    multimodal_input BOOLEAN DEFAULT FALSE,
    reasoning_enabled BOOLEAN DEFAULT FALSE,
    usd_per_million_input_tokens DECIMAL(10, 5),
    usd_per_million_output_tokens DECIMAL(10, 5),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Create the table for Audio Models (TTS, STT, etc.)
CREATE TABLE audio_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    api_name VARCHAR(255),
    context_window_max_tokens INT,
    supports_images_input BOOLEAN DEFAULT FALSE,
    supports_pdfs_input BOOLEAN DEFAULT FALSE,
    multimodal_input BOOLEAN DEFAULT TRUE,
    reasoning_enabled BOOLEAN DEFAULT FALSE,
    usd_per_million_input_tokens DECIMAL(10, 5),
    usd_per_million_output_tokens DECIMAL(10, 5),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Create the table for Video Generation Models
CREATE TABLE video_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    api_name VARCHAR(255),
    context_window_max_tokens INT,
    supports_images_input BOOLEAN DEFAULT TRUE,
    supports_pdfs_input BOOLEAN DEFAULT FALSE,
    multimodal_input BOOLEAN DEFAULT TRUE,
    reasoning_enabled BOOLEAN DEFAULT FALSE,
    usd_per_million_input_tokens DECIMAL(10, 5),
    usd_per_million_output_tokens DECIMAL(10, 5),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);