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

INSERT INTO groups
(id, group_admin_username, group_name)
VALUES
(1, 'Noah', 'WW'),
(2, 'Ben', 'Elephant'),
(3, 'Noah', 'Laufey Fan Club'),
(4, 'Jace', 'Blood brothers');

INSERT INTO group_members
(group_id, username, outstanding_balance)
VALUES
(1, 'Ben', 0),
(1, 'Jace', 93),
(1, 'Lucca', 300),
(1, 'Owen', 55),
(1, 'Logan', 34.21),
(2, 'Lucca', 80.20),
(2, 'Jace', 1),
(2, 'Noah', 0),
(3, 'Logan', 22),
(3, 'Lucca', 10),
(4, 'Noah', 2),
(4, 'Ben', 55.66);

INSERT INTO transactions_group
(group_id, charge_amount, charge_name, date, requester_username, group_name, members_who_paid)
VALUES
(1, 50, 'Group dinner', '10/24/23', 'Noah', 'WW', '{}'),
(1, 1, 'Everyone pays 1 dollar haha', '01/24/24', 'Ben', 'WW', '{}'),
(1, 100, 'Concert tickets', '08/19/23', 'Noah', 'WW', '{}'),
(1, 1000, 'Road trip money', '04/04/24', 'Jace', 'WW', '{}');

INSERT INTO transactions_individual
(charge_amount, charge_desc, date, sender_username, recipient_username)
VALUES
(52.54, 'Groceries payback', '04/10/24', 'Noah', 'Ben'),
(8.99, 'Museum', '04/17/24', 'Owen', 'Ben'),
(65.46, 'Velveeta super pack', '03/23/24', 'Jace', 'Logan'),
(70.73, 'Chinese food', '02/22/24', 'Logan', 'Lucca'),
(3.33, 'Paper', '01/22/24', 'Logan', 'Lucca'),
(33.44, 'New hat', '04/14/24', 'Ben', 'Jace'),
(77.99, 'Gambling money', '01/01/24', 'Logan', 'Owen'),
(12345.67, 'My life savings', '03/04/24', 'Jace', 'Lucca'),
(69, ';)', '04/01/24', 'Owen', 'Jace'),
(81, '54 Costco Hot Dogs', '02/21/24', 'Noah', 'Ben');
