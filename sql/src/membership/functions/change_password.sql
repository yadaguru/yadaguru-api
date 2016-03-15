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
