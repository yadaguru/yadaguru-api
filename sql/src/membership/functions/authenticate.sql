create or replace function authenticate(
    auth_phone_number char(10),
    auth_personal_login_token char(6),
    ip inet
)
returns TABLE (
    user_id bigint,
    session_id bigint,
    message varchar(255),
    phone_number char(10),
    success boolean
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
    select 'Invalid phone number or password' into message;

    select membership.users.id from membership.users
      where membership.users.phone_number=auth_phone_number
      AND membership.users.personal_login_token = auth_personal_login_token
      into return_id;

    if not return_id is NULL then

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

    end if;

    return query
    --the command result has success, message, and a JSON package
    --select success, message, data_result;
    select return_id, new_session_id, message, auth_phone_number, success;

END;
$$ LANGUAGE PLPGSQL;
