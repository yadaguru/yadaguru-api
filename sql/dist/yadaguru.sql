--built on Tue Mar 15 2016 14:13:03 GMT-0400 (EDT)

BEGIN;

--kill the membership schema, tables, and functions
drop schema if exists membership CASCADE;

--good to use a schema to keep your tables, views, functions
--organized and confined
create schema membership;

--set this so what we create here will be applied to the membership schema
set search_path=membership;

--global functions
create or replace function random_value(len int, out result varchar(32))
  as
$$
BEGIN
SELECT substring(md5(random()::text),0, len) into result;
END
$$ LANGUAGE plpgsql;

--a scalable id generator that works like snowflake
--http://rob.conery.io/2014/05/29/a-better-id-generator-for-postgresql/
CREATE OR REPLACE FUNCTION id_generator(OUT result bigint) AS $$
DECLARE
  our_epoch bigint := 1314220021721;
  seq_id bigint;
  now_millis bigint;
  shard_id int := 1;
  BEGIN
    SELECT nextval('membership.membership_id_seq')%1024 INTO seq_id;

    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
    result := (now_millis - our_epoch) << 23;
    result := result | (shard_id << 10);
    result := result | (seq_id);
  END;
$$ LANGUAGE PLPGSQL;

--sequence for id generator
create sequence membership_id_seq;

--log enum, change as needed
create type log_type as ENUM('registration', 'authentication', 'activity', 'system');

-- for our member lookup bits
create type member_summary as (
  id bigint,
  email varchar(255),
  status varchar(50),
  can_login bool,
  is_admin bool,
  member_key varchar(12),
  email_validation_token varchar(36),
  created_at timestamptz,
  signin_count int,
  social json,
  location json,
  logs json,
  roles json
);

--drop in pgcrypto if it's not there
create extension if not exists pgcrypto with schema membership;

select 'DB Initialized' as result;


-- Stores data from specific users
create table logs(
    id serial primary key not null,
    subject log_type,
    user_id bigint not null,
    entry text not null,
    data json,
    created_at timestamptz default current_timestamp
);


-- Membership mailers

-- TODO refactor to be texts over emails
create table mailers(
    id serial primary key not null,
    name varchar(255) not null,
    from_address varchar(255),
    from_name varchar(255),
    subject varchar(255),
    template_markdown text
);

insert into membership.mailers(name,from_address,from_name, subject, template_markdown)
values('Welcome','noreply@site.com','Admin','Welcome to Our Site','Welcome to our site!');

insert into membership.mailers(name,from_address,from_name, subject, template_markdown)
values('password-reset','noreply@site.com','Admin','Password Reset Instructions','Welcome to our site!');

insert into membership.mailers(name,from_address,from_name, subject, template_markdown)
values('validation','noreply@site.com','Admin','Email Validation Request','Welcome to our site!');

insert into membership.mailers(name,from_address,from_name, subject, template_markdown)
values('general','noreply@site.com','Admin','Welcome to Our Site','Welcome to our site!');


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


-- Tracks sessions
create table sessions(
    id bigint primary key not null unique DEFAULT id_generator(),
    token varchar(24) not null unique default random_value(24),
    ip inet,
    user_id bigint not null,
    created_at timestamptz not null DEFAULT current_timestamp,
    expires_at timestamptz not null
);


-- Settings for logins
-- TODO: Major refactor for phone number login
create table settings(
    id serial primary key not null,
    allow_token_login boolean not null default true,
    lock_trigger int not null default 0,
    reset_password_within_hours int not null default 6,
    session_length_weeks int not null default 2,
    email_validation_required boolean not null default false,
    email_from_name varchar(50) not null,
    email_from_address varchar(125) not null
);

insert into membership.settings(email_from_name, email_from_address)
values ('Admin', 'admin@example.com');


-- User statuses
create table status(
    id int  primary key not null,
    name varchar(50),
    description varchar(255),
    can_login boolean not null default true
);

-- default statuses
insert into membership.status(id, name, description) values(10, 'Active', 'User can login, etc');
insert into membership.status(id, name, description,can_login) values(20, 'Suspended','Cannot login for a given reason',false);
insert into membership.status(id, name, description,can_login) values(30, 'Not Approved','Member needs to be approved (email validation, etc)',false);
insert into membership.status(id, name, description,can_login) values(99, 'Banned','Member has been banned',false);
insert into membership.status(id, name, description,can_login) values(88, 'Locked', 'Member is locked out due to failed logins',false);


-- Keeps track of users
create table users(
    id bigint primary key not null unique DEFAULT id_generator(),
    phone_number char(10) not null unique,
    created_at timestamptz DEFAULT current_timestamp,
    phone_number_validation_token char(6) default random_value(6),
    personal_login_token char(6),
    reset_password_token_set_at timestamptz,
    search tsvector,
    signin_count int
);

CREATE TRIGGER users_search_vector_refresh
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger(search, 'pg_catalog.english',  phone_number);


select 'tables installed' as result;

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


create or replace function add_member_to_role(member_email varchar(255), new_role_id int, out succeeded bool)
as $$
DECLARE
found_member_id bigint;
selected_role varchar(50);
BEGIN
    select false into succeeded;
    if exists(select id from membership.users where email=member_email) then
        select id into found_member_id from membership.users where email=member_email;
        if not exists(select user_id from membership.users_roles where user_id = found_member_id and role_id=new_role_id) then
            insert into membership.users_roles(user_id, role_id) values (found_member_id, new_role_id);
            --add a log entry
            select description into selected_role from membership.roles where id=new_role_id;
            insert into membership.logs(subject,entry,user_id, created_at)
            values('registration','Member added to role ' || selected_role,found_member_id,now());
            select true into succeeded;
        end if;
    end if;
END;
$$ LANGUAGE plpgsql;

create or replace function authenticate(
    phone_number char(10),
    personal_login_token char(6),
    prov varchar(50),
    ip inet
)
returns TABLE (
    user_id bigint,
    session_id bigint,
    message varchar(255),
    email varchar(255),
    success boolean,
    public_name varchar(255)
) as

$$
DECLARE
  return_id bigint;
  return_name varchar(255);
  new_session_id bigint;
  message varchar(255);
  success boolean;
  found_user membership.users;
  session_length int;
  member_can_login boolean;
  search_token varchar(255);
BEGIN

    --defaults
    select false into success;
    select 'Invalid username or password' into message;

    select membership.users.id from membership.users
      where membership.users.phone_number=phone_number
      AND membership.users.personal_login_token = personal_login_token
      into return_id;

    if not return_id is NULL then

        select can_login from membership.status
        inner join membership.users on membership.status.id = membership.users.membership_status_id
        where membership.users.id = return_id into member_can_login;

        if member_can_login then
            --yay!
            select true into success;

            select * from membership.users where membership.users.id=return_id into found_user;
            select 'Successfully authenticated' into message;
            select found_user.id into return_id;

            -- update user stats
            update membership.users set
            signin_count = signin_count + 1
            where id = return_id;

            -- deal with old sessions
            if exists(select id from membership.sessions where membership.sessions.user_id=return_id and expires_at >= now() ) then
                update membership.sessions set expires_at = now() where membership.sessions.user_id=return_id and expires_at >= now();
            end if;

            -- since this is a new login, create a new session - this will invalidate
            -- any shared login sessions where 2 people use the same account
            select session_length_weeks into session_length from membership.settings limit 1;

            --create a session
            insert into membership.sessions(user_id, created_at, expires_at, ip)
            values (return_id, now(), now() + interval '1 week' * session_length, ip) returning id into new_session_id;

            -- add a log entry
            insert into  membership.logs(subject, entry, user_id, created_at)
            values('authentication', 'Successfully logged in', return_id, now());

        else
            --TODO: Use a friendly message here from the DB
            select 'Currently unable to login' into message;
        end if;

    end if;

    return query
    --the command result has success, message, and a JSON package
    --select success, message, data_result;
    select return_id, new_session_id, message, pkey, success, return_name;

END;
$$ LANGUAGE PLPGSQL;


create or replace function change_password(
  phone_number char(10),
  personal_login_token char(10),
  new_personal_login_token char(10)
)
returns TABLE(
  message varchar(255),
  succeeded bool
)
as $$
DECLARE
found_id bigint;
return_message varchar(255);
password_changed bool;
BEGIN
  --initial result
  select false into password_changed;

  --first, verify that the old password is correct and also find the user
  select membership.users.id from membership.users
  where membership.users.phone_number=phone_number
  AND membership.users.personal_login_token=personal_login_token
  into found_id;


  if found_id IS NOT NULL THEN
    -- crypt the new one and save it
    update membership.users set personal_login_token = new_personal_login_token
    where user_id = found_id;

    -- log the change
    insert into membership.logs(subject,entry,user_id, created_at)
    values('authentication','Password changed', found_id,now());

    select true into password_changed;
    select 'Password changed successfully' into return_message;
  else
    select 'User not found or password incorrect' into return_message;
    end if;

  return query
  select return_message,password_changed;
END;
$$ LANGUAGE PLPGSQL;


create or replace function get_current_user(session_id bigint)
returns TABLE(
    user_id bigint,
    email varchar(255))
as
$$
DECLARE
found_id bigint;
found_user membership.users;
begin

    --session exist?
    if exists(select id from membership.sessions where id=session_id AND expires_at >= now()) then
        --get the user record
        select membership.sessions.user_id into found_id from membership.sessions where id=session_id;
        select * from membership.users where id=found_id into found_user;

        --reset the expiration on the session
        update membership.sessions set expires_at = now() + interval '2 weeks' where membership.sessions.id = session_id;

    end if;

    return query
    select found_user.id,
    found_user.email;

end;
$$ language plpgsql;


create or replace function get_member_by_email(member_email varchar(255))
returns setof member_summary
as $$
DECLARE found_id bigint;
BEGIN
  select id
  from membership.users
  into found_id
  where email = member_email;

  return query
  select * from membership.get_member(found_id);
END;
$$ LANGUAGE PLPGSQL;


create or replace function get_member(user_id bigint)
returns setof member_summary
as $$
DECLARE
  found_user membership.users;
  parsed_logs json;
  parsed_roles json;
  member_status varchar(50);
  member_can_login bool;
  member_is_admin bool;
BEGIN

  if exists(select users.id from membership.users where users.id=user_id) then
    select * into found_user from membership.users where users.id=user_id;

    select name into member_status
    from membership.status
    where membership.status.id = found_user.membership_status_id;

    select membership.status.can_login into member_can_login
    from membership.status
    where membership.status.id = found_user.membership_status_id;

    select exists (select membership.users_roles.user_id
                  from membership.users_roles
                  where membership.users_roles.user_id = found_user.id AND role_id = 10) into member_is_admin;

    select json_agg(x) into parsed_logs from
    (select * from membership.logs where membership.logs.user_id=found_user.id) x;

    select json_agg(z) into parsed_roles from
    (select * from membership.roles
    inner join membership.users_roles on membership.roles.id = membership.users_roles.role_id
    where membership.users_roles.user_id=found_user.id) z;



  end if;

  return query
  select found_user.id,
  found_user.email,
  member_status,
  member_can_login,
  member_is_admin,
  found_user.member_key,
  found_user.email_validation_token,
  found_user.created_at,
  found_user.signin_count,
  found_user.social,
  found_user.location,
  parsed_logs,
  parsed_roles;
end;
$$ LANGUAGE PLPGSQL;


create or replace function register(
    new_phone_number char(10)
)

returns TABLE (
    new_id bigint,
    message varchar(255),
    phone_number varchar(10),
    success BOOLEAN,
    status int,
    phone_number_validation_token char(6))
as
$$
DECLARE
    new_id bigint;
    message varchar(255);
    -- hashedpw varchar(255);
    success BOOLEAN;
    return_phone_number char(10);
    return_status int;
    phone_number_validation_token char(10);
    verify_phone_number boolean;

BEGIN
    --default this to 'Not Approved'
    select 30, false, new_phone_number into return_status, success, return_phone_number;

    -- TODO: move to first login
    -- TODO: verify passwords match
    -- if(pass <> confirm) THEN
        -- select 'Password and confirm do not match' into message;

    if exists(select membership.users.phone_number from membership.users where membership.users.phone_number=return_phone_number)  then
        select 0 into new_id;
        select 'Phone Number exists' into message;
    ELSE
        select true into success;
        -- TODO: move to first login
        -- TODO: encrypt confirm_code, personal_code, phone_number
        -- SELECT membership.crypt(pass, membership.gen_salt('bf', 10)) into hashedpw;
        select membership.random_value(6) into phone_number_validation_token;

        insert into membership.users(phone_number, created_at, phone_number_validation_token, membership_status_id )
        VALUES(new_phone_number, now(), phone_number_validation_token, return_status, phone_number_validation_token) returning id into new_id;

        select 'Successfully registered' into message;

        -- add them to the users role
        insert into membership.users_roles(user_id, role_id)
        VALUES(new_id, 99);

        --add log entry
        insert into membership.logs(subject,entry,user_id, created_at)
        values('registration','Added to system, set role to User',new_id,now());

        perform membership.change_status(return_email,10,'Activated member during registration');

        --TODO: Mailer
    end if;

    return query
    select new_id, message, new_phone_number, success, return_status, phone_number_validation_token;
END;
$$ LANGUAGE PLPGSQL;


create or replace function remove_member_from_role(
  member_email varchar(255),
  remove_role_id int, out succeeded bool
)
as $$
DECLARE
  found_member_id bigint;
  selected_role varchar(50);
BEGIN
  select false into succeeded;
  if exists(select id from membership.users where email=member_email) then
    select id into found_member_id from membership.users where email=member_email;
    delete from membership.users_roles where user_id=found_member_id AND role_id=remove_role_id;
    --add a log entry
    select description into selected_role from membership.roles where id=remove_role_id;
    insert into logs(subject,entry,user_id, created_at)
    values('registration','Member removed from role ' || selected_role,found_member_id,now());
    select true into succeeded;
  end if;
END;
$$ LANGUAGE PLPGSQL;

create or replace function change_status(member_email varchar(255), new_status_id int, message varchar(255),out succeeded bool)
as $$
DECLARE
found_id bigint;
BEGIN
  select false into succeeded;
  select id into found_id from membership.users where email=member_email;
  if found_id IS NOT NULL THEN
    update membership.users set membership_status_id=new_status_id where email=member_email;
    --add a log entry
    insert into membership.logs(subject,entry,user_id, created_at)
    values('authentication',message,found_id,now());
    select true into succeeded;
  end if;
END;
$$ LANGUAGE PLPGSQL;


create or replace function lock_member(member_email varchar(255),out succeeded bool)
as $$
DECLARE
found_id bigint;
BEGIN
  select membership.change_status(member_email,88,'Member locked out') into succeeded;
END;

$$ LANGUAGE PLPGSQL;

create or replace function suspend_member(member_email varchar(255), reason varchar(512),out succeeded bool)
as $$
DECLARE
found_id bigint;
BEGIN
  select membership.change_status(member_email,20,'Member suspended: ' || reason) into succeeded;
END;
$$ LANGUAGE PLPGSQL;

create or replace function ban_member(member_email varchar(255), reason varchar(512),out succeeded bool)
as $$
BEGIN
  select membership.change_status(member_email,99,'Member banned: ' || reason) into succeeded;
END;

$$ LANGUAGE PLPGSQL;

create or replace function activate_member(member_email varchar(255),out succeeded bool)
as $$
DECLARE
BEGIN
  select membership.change_status(member_email,10,'Activated member') into succeeded;
END;
$$ LANGUAGE PLPGSQL;


select 'functions installed' as result;

COMMIT;

--built on Tue Mar 15 2016 14:13:03 GMT-0400 (EDT)

BEGIN;

--kill the membership schema, tables, and functions
drop schema if exists reminder CASCADE;

--good to use a schema to keep your tables, views, functions
--organized and confined
create schema reminder;

--set this so what we create here will be applied to the membership schema
set search_path=reminder;

--global functions

--log enum
-- TODO: Flesh out log_type
create type log_type as ENUM('system');
-- TODO: log level enum, error, ect.

--type for reminder summary
-- TODO: Write reminder_summary

select 'DB Initialized' as result;


create table categories(
  id serial primary key not null,
  name varchar(25) not null unique
);

create table reminders_categories(
  reminder_id int not null,
  category_id int not null,
  primary key (reminder_id, category_id)
);

insert into reminder.categories (name) values('Absolute Deadline');
insert into reminder.categories (name) values('Application');
insert into reminder.categories (name) values('Essay Writing');
insert into reminder.categories (name) values('Financial Aid');
insert into reminder.categories (name) values('General Reminder');
insert into reminder.categories (name) values('Portfolio Prep');
insert into reminder.categories (name) values('Recommendations');
insert into reminder.categories (name) values('Testing Registration');


create table faqs(
  id serial primary key not null,
  question text unique,
  answer text
);


create table logs(
  id serial primary key not null,
  subject log_type,
  -- TODO: Should we have a memberid reference for this?
  -- If not do we want to capture other data?
  entry text not null,
  data json,
  created_at timestamptz default current_timestamp
);


create table settings(
  id serial primary key not null,
  name varchar(50) not null unique,
  value varchar(50)
);

insert into reminder.settings(name, value) values ('summerCutoffMonth', '7');
insert into reminder.settings(name, value) values ('summerCutoffDay', '2');


create table timeframes(
  id serial primary key not null,
  value varchar(25) not null unique
);

create table reminders_timeframes(
  reminder_id int not null,
  timeframe_id int[] not null,
  primary key (reminder_id, timeframe_id)
);

insert into reminder.timeframes (value) values('jan1');
insert into reminder.timeframes (value) values('may1');
insert into reminder.timeframes (value) values('summer');
insert into reminder.timeframes (value) values('0');
insert into reminder.timeframes (value) values('7');
insert into reminder.timeframes (value) values('12');
insert into reminder.timeframes (value) values('14');
insert into reminder.timeframes (value) values('21');
insert into reminder.timeframes (value) values('30');
insert into reminder.timeframes (value) values('60');
insert into reminder.timeframes (value) values('90');


select 'tables installed' as result;

set search_path = reminder;

--ALTER TABLE reminders_timeframes
--ADD CONSTRAINT reminder_timeframes_timeframes
--FOREIGN KEY (timeframe_id) REFERENCES timeframes (id) on delete cascade;

--ALTER TABLE reminders_timeframes
--ADD CONSTRAINT reminder_timeframes_reminders
--FOREIGN KEY (reminder_id) REFERENCES reminders (id) on delete cascade;

--ALTER TABLE reminders_categories
--ADD CONSTRAINT reminder_categories_categories
--FOREIGN KEY (category_id) REFERENCES categories (id) on delete cascade;

--ALTER TABLE reminders_categories
--ADD CONSTRAINT reminder_categories_reminders
--FOREIGN KEY (reminder_id) REFERENCES reminders (id) on delete cascade;




COMMIT;