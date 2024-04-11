-- Create the users table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255)
);

-- Create the friends table
DROP TABLE IF EXISTS friendships;
CREATE TABLE friendships (
    user_username VARCHAR(255),
    friend_username VARCHAR(255),
    PRIMARY KEY (user_username, friend_username),
    FOREIGN KEY (user_username) REFERENCES users(username),
    FOREIGN KEY (friend_username) REFERENCES users(username)
);

-- Create the groups table
DROP TABLE IF EXISTS groups;
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_admin_username VARCHAR(255),
    group_name VARCHAR(255),
    FOREIGN KEY (group_admin_username) REFERENCES users(username)
);

-- Create the group_members table
DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members (
    group_id INT,
    username VARCHAR(255),
    --PRIMARY KEY (group_id, username),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (username) REFERENCES users(username)
);
/*
--Create transaction table
CREATE TABLE transactions(
  charge_amount FLOAT,
  charge_desc CHAR(50),
  date VARCHAR(20),
  sender_username VARCHAR(255),
  recipient_username VARCHAR(255),
  group_id INT,
<<<<<<< HEAD
  FOREIGN KEY (group_id) REFERENCES groups(id)
);
*/
=======
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (sender_username) REFERENCES users(username),
  FOREIGN KEY (recipient_username) REFERENCES users(username)
)
>>>>>>> 086db9bccec9b6205807a99d37691b66bb76069f
