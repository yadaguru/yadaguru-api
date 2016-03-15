create or replace function validate_account(
    auth_phone_number char(10),
    auth_phone_number_validation_token char(6),
    new_personal_login_token char(6)
)

returns TABLE (
    message varchar(255),
    success boolean)
as
$$
DECLARE
  return_id bigint;
  message varchar(255);
  member_can_login boolean;
  success boolean;
BEGIN
    --defaults
    select false into success;
    select 'Invalid phone number or validation token' into message;

    select membership.users.id from membership.users
      where membership.users.phone_number=auth_phone_number
      AND membership.users.phone_number_validation_token=auth_phone_number_validation_token
      into return_id;

    if not return_id is NULL then

        --yay!
        select true into success;
        select 'Successfully validated and set password' into message;

        -- delete phone_number_validation_token
        update membership.users set phone_number_validation_token = null
        where id = return_id;

        -- set personal_login_token
        update membership.users set personal_login_token = new_personal_login_token
        where id = return_id;

        -- add a log entry
        insert into  membership.logs(subject, entry, user_id, created_at)
        values('validation', 'Successfully validated and set password', return_id, now());

    end if;

    return query
    select message, success;
END;
$$ LANGUAGE PLPGSQL;
