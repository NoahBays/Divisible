-- Create the users table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255)
);

-- Create the friends table
DROP TABLE IF EXISTS friendships;
CREATE TABLE friendships (
    user_id INT,
    friend_id INT,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(username),
    FOREIGN KEY (friend_id) REFERENCES users(username)
);

-- Create the groups table
DROP TABLE IF EXISTS groups;
CREATE TABLE groups (
    id INT PRIMARY KEY,
    group_admin INT,
    FOREIGN KEY (group_admin) REFERENCES users(username)
);

-- Create the group_members table
DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members (
    group_id INT,
    user_id INT,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (user_id) REFERENCES users(username)
);
