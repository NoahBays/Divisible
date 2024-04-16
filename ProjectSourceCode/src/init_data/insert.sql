INSERT INTO users
(username, password, wallet)
VALUES
--If you want to test yourself, the password is the same for everyone which is "lmnop"
('Noah','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 6354.31),
('Ben','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 71464.22),
('Jace','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 7454.86),
('Lucca','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 69247.40),
('Owen','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 454752.35),
('Logan','$2b$10$zYuTFaV3uXI1X54Cj0dCQO1HnKQPTSYk1S7CUF7lYoYMS7cKVDP82', 594220.40),
--Username and password "a"
('a','$2b$10$whBSEpqgXwZRCDV9Sl.wtedvQ7KpM8Onq5W1XXf658xsateej3qIq', 0.00);

INSERT INTO friendships
(user_username, friend_username, outstanding_balance)
VALUES
('Noah', 'Ben', 296.57),
('Ben', 'Noah', -296.57),
('Noah', 'Jace', 682.16),
('Jace', 'Noah', -682.16),
('Noah', 'Lucca', 50.92),
('Lucca', 'Noah', -50.92),
('Noah', 'Owen', 820.10),
('Owen', 'Noah', -820.10),
('Noah', 'Logan', 321.99),
('Logan', 'Noah', -321.99),
('Owen', 'Ben', 314.23),
('Ben', 'Owen', -314.23),
('Owen', 'Jace', 554.46),
('Jace', 'Owen', -554.46),
('Ben', 'Lucca', 708.52),
('Lucca', 'Ben', -708.52),
('Jace', 'Lucca', 797.49),
('Lucca', 'Jace', -797.49),
('Logan', 'Lucca', 499.20),
('Lucca', 'Logan', -499.20);

-- INSERT INTO groups
-- (id, group_admin_username, group_name)
-- VALUES
-- (1, 'Noah', 'WW'),
-- (2, 'Ben', 'Elephant');

-- INSERT INTO group_members
-- (group_id, username)
-- VALUES
-- (1, 'Ben'),
-- (1, 'Jace'),
-- (1, 'Lucca'),
-- (1, 'Owen'),
-- (1, 'Logan'),
-- (2, 'Lucca'),
-- (2, 'Jace'),
-- (2, 'Noah');