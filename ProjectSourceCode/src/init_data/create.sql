CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255),
    email VARCHAR(255),
    profile_picture_url VARCHAR(255),
    wallet FLOAT
);

-- Create the friends table
CREATE TABLE friendships (
    user_username VARCHAR(255),
    friend_username VARCHAR(255),
    outstanding_balance FLOAT,
    PRIMARY KEY (user_username, friend_username),
    FOREIGN KEY (user_username) REFERENCES users(username),
    FOREIGN KEY (friend_username) REFERENCES users(username)
);

-- Create the groups table
CREATE TABLE groups (
    id INT PRIMARY KEY,
    group_admin_username VARCHAR(255),
    group_name VARCHAR(255) UNIQUE,
    FOREIGN KEY (group_admin_username) REFERENCES users(username)
);

-- Create the group_members table
CREATE TABLE group_members (
    group_id INT,
    username VARCHAR(255),
    outstanding_balance float,
    PRIMARY KEY (group_id, username),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (username) REFERENCES users(username)
);

--Create transaction table
CREATE TABLE transactions_group(
  group_id INT,
  charge_amount FLOAT,
  charge_name CHAR(50),
  date VARCHAR(20),
  requester_username VARCHAR(255),
  group_name VARCHAR(255),
  members_who_paid VARCHAR(255) [],
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (group_name) REFERENCES groups(group_name),
  FOREIGN KEY (requester_username) REFERENCES users(username)
);

CREATE TABLE transactions_individual(
  charge_amount FLOAT,
  charge_desc CHAR(50),
  date VARCHAR(20),
  sender_username VARCHAR(255),
  recipient_username VARCHAR(255),
  FOREIGN KEY (sender_username) REFERENCES users(username),
  FOREIGN KEY (recipient_username) REFERENCES users(username)
);
CREATE TABLE requests(
  charge_amount FLOAT,
  charge_desc CHAR(50),
  date VARCHAR(20),
  asker_username VARCHAR(255),
  recipient_username VARCHAR(255),
  FOREIGN KEY (asker_username) REFERENCES users(username),
  FOREIGN KEY (recipient_username) REFERENCES users(username)
);