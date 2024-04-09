
-- Create the users table
CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255)
);

-- Create the friends table
CREATE TABLE friendships (
    username VARCHAR(255),
    friend_username VARCHAR(255),
    PRIMARY KEY (username, friend_username),
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (friend_username) REFERENCES users(username)
);

-- Create the groups table
CREATE TABLE groups (
    id INT PRIMARY KEY,
    group_admin_username VARCHAR(255),
    FOREIGN KEY (group_admin_username) REFERENCES users(username)
);

-- Create the group_members table
CREATE TABLE group_members (
    group_id INT,
    username VARCHAR(255),
    PRIMARY KEY (group_id, username),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (username) REFERENCES users(username)
);
