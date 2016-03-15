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
