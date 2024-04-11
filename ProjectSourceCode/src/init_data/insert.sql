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

INSERT INTO group_members
(group_id, username)
VALUES
(1, 'Logan') returning * ;

INSERT INTO group_members
(group_id, username)
VALUES
(1, 'Ben') returning * ;

INSERT INTO group_members
(group_id, username)
VALUES
(1, 'Jace') returning * ;
