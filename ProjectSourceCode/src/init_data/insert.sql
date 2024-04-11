-- INSERT INTO users
-- (username, password)
-- VALUES
-- ('Noah', 'lmnop'),
-- ('Ben', 'wxyz'),
-- ('Jace', 'abcde');

-- INSERT INTO friendships
-- (user_username, friend_username)
-- VALUES
-- ('Noah', 'Ben'),
-- ('Ben', 'Jace');

INSERT INTO groups
(id, group_admin_username, group_name)
VALUES
(1, 'Noah', 'Wallet Wizards') returning * ;