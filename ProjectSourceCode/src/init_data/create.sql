DROP TABLE IF EXISTS users;
CREATE TABLE users (
  username VARCHAR(50) PRIMARY KEY NOT NULL,
  password CHAR(60) NOT NULL
);

/*
DROP TABLE IF EXISTS groups;
CREATE TABLE groups (
  group_name VARCHAR(50) PRIMARY KEY,
  friends CHAR(60) NOT NULL,
  transaction CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS friends;
CREATE TABLE friends (
  friend VARCHAR(50) PRIMARY KEY
);
*/ 