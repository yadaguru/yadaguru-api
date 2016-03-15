-- List of all roles
create table roles(
    id integer primary key not null,
    description varchar(24) not null
);

-- member-role mapping
create table users_roles(
    user_id bigint not null,
    role_id int not null,
    primary key (user_id, role_id)
);

-- default roles
insert into membership.roles (id, description) values(10, 'Administrator');
insert into membership.roles (id, description) values(99, 'User');
