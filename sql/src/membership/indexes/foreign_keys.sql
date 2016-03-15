set search_path = membership;

ALTER TABLE logs
ADD CONSTRAINT logs_members
FOREIGN KEY (user_id) REFERENCES users (id) on delete cascade;

ALTER TABLE users_roles
ADD CONSTRAINT member_roles_members
FOREIGN KEY (user_id) REFERENCES users (id) on delete cascade;

ALTER TABLE users_roles
ADD CONSTRAINT member_roles_roles
FOREIGN KEY (role_id) REFERENCES roles (id) on delete cascade;

ALTER TABLE sessions
ADD CONSTRAINT sessions_members
FOREIGN KEY (user_id) REFERENCES users(id) on delete cascade;
