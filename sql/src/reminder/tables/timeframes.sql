create table timeframes(
  id serial primary key not null,
  value varchar(25) not null unique
);

create table reminders_timeframes(
  reminder_id bigint not null,
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
