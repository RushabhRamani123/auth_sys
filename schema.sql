CREATE DATABASE auth_system;
USE auth_system;

CREATE TABLE users (
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);