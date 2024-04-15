INSERT INTO users
(username, password)
VALUES
--If you want to test yourself, the password is the same for everyone which is "lmnop"
('Noah','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82'),
('Ben','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82'),
('Jace','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82'),
('Lucca','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82'),
('Owen','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82'),
('Logan','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82'),
--Username and password "a"
('a','$2b$10$whBSEpqgXwZRCDV9Sl.wtedvQ7KpM8Onq5W1XXf658xsateej3qIq');
-- INSERT INTO users
-- (username, password)
-- VALUES
-- ('Noah', 'lmnop'),
-- ('Ben', 'wxyz'),
-- ('Jace', 'abcde');

INSERT INTO friendships
(user_username, friend_username)
(user_username, friend_username)
VALUES
('Noah', 'Ben'),
('Ben', 'Noah'),
('Noah', 'Jace'),
('Jace', 'Noah'),
('Noah', 'Lucca'),
('Lucca', 'Noah'),
('Noah', 'Owen'),
('Owen', 'Noah'),
('Noah', 'Logan'),
('Logan', 'Noah'),
('Owen', 'Ben'),
('Ben', 'Owen'),
('Owen', 'Jace'),
('Jace', 'Owen'),
('Ben', 'Lucca'),
('Lucca', 'Ben'),
('Jace', 'Lucca'),
('Lucca', 'Jace'),
('Logan', 'Lucca'),
('Lucca', 'Logan');

INSERT INTO groups
(id, group_admin_username, group_name)
VALUES
(1, 'Noah', 'WW'),
(2, 'Ben', 'Elephant');

INSERT INTO group_members
(group_id, username)
VALUES
(1, 'Ben'),
(1, 'Jace'),
(1, 'Lucca'),
(1, 'Owen'),
(1, 'Logan'),
(2, 'Lucca'),
(2, 'Jace'),
(2, 'Noah');
-- INSERT INTO friendships
-- (user_username, friend_username)
-- VALUES
-- ('Noah', 'Ben'),
-- ('Ben', 'Jace');