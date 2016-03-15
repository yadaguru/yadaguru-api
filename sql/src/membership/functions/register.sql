create or replace function register(
    new_phone_number char(10)
)

returns TABLE (
    new_id bigint,
    message varchar(255),
    success BOOLEAN,
    phone_number char(10),
    phone_number_validation_token char(6))
as
$$
DECLARE
    new_id bigint;
    message varchar(255);
    success BOOLEAN;
    return_phone_number char(10);
    phone_number_validation_token char(6);

BEGIN
    select false, new_phone_number into success, return_phone_number;

    if exists(select membership.users.phone_number from membership.users where membership.users.phone_number=return_phone_number)  then
        select 0 into new_id;
        select 'Phone number exists' into message;
    ELSE
        select true into success;
        select membership.random_value(6) into phone_number_validation_token;

        insert into membership.users(phone_number, created_at, phone_number_validation_token)
        VALUES(new_phone_number, now(), phone_number_validation_token) returning id into new_id;

        select 'Successfully registered' into message;

        -- add them to the users role
        insert into membership.users_roles(user_id, role_id)
        VALUES(new_id, 99);

        --add log entry
        insert into membership.logs(subject,entry,user_id, created_at)
        values('registration','Added to system, set role to User',new_id,now());

        --TODO: Mailer
    end if;

    return query
    select new_id, message, success, new_phone_number, phone_number_validation_token;
END;
$$ LANGUAGE PLPGSQL;
