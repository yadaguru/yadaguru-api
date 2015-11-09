create table settings(
  id serial primary key not null,
  name varchar(50) not null unique,
  value varchar(50)
);

insert into reminder.settings(name, value) values ('summerCutoffMonth', '7');
insert into reminder.settings(name, value) values ('summerCutoffDay', '2');
