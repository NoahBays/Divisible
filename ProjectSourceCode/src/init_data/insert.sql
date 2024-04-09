INSERT INTO users
(username, password)
VALUES
('Noah','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82'),
('Ben','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82');

INSERT INTO friendships
(username, friend_username)
VALUES
('Noah', 'Ben'),
('Ben', 'Noah');