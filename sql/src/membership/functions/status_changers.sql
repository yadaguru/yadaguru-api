create or replace function change_status(member_phone_number char(10), new_status_id int, message varchar(255),out succeeded bool)
as $$
DECLARE
found_id bigint;
BEGIN
  select false into succeeded;
  select id into found_id from membership.users where phone_number=member_phone_number;
  if found_id IS NOT NULL THEN
    update membership.users set membership_status_id=new_status_id where phone_number=member_phone_number;
    --add a log entry
    insert into membership.logs(subject,entry,user_id, created_at)
    values('authentication',message,found_id,now());
    select true into succeeded;
  end if;
END;
$$ LANGUAGE PLPGSQL;


create or replace function lock_member(member_phone_number varchar(255),out succeeded bool)
as $$
DECLARE
found_id bigint;
BEGIN
  select membership.change_status(member_phone_number,88,'Member locked out') into succeeded;
END;

$$ LANGUAGE PLPGSQL;

create or replace function suspend_member(member_phone_number varchar(255), reason varchar(512),out succeeded bool)
as $$
DECLARE
found_id bigint;
BEGIN
  select membership.change_status(member_phone_number,20,'Member suspended: ' || reason) into succeeded;
END;
$$ LANGUAGE PLPGSQL;

create or replace function ban_member(member_phone_number varchar(255), reason varchar(512),out succeeded bool)
as $$
BEGIN
  select membership.change_status(member_phone_number,99,'Member banned: ' || reason) into succeeded;
END;

$$ LANGUAGE PLPGSQL;

create or replace function activate_member(member_phone_number varchar(255),out succeeded bool)
as $$
DECLARE
BEGIN
  select membership.change_status(member_phone_number,10,'Activated member') into succeeded;
END;
$$ LANGUAGE PLPGSQL;
