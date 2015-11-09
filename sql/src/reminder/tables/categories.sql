create table categories(
  id serial primary key not null,
  name varchar(25) not null unique
);

create table reminders_categories(
  reminder_id int not null,
  category_id int not null,
  primary key (reminder_id, category_id)
);

insert into reminder.categories (value) values('Absolute Deadline');
insert into reminder.categories (value) values('Application');
insert into reminder.categories (value) values('Essay Writing');
insert into reminder.categories (value) values('Financial Aid');
insert into reminder.categories (value) values('General Reminder');
insert into reminder.categories (value) values('Portfolio Prep');
insert into reminder.categories (value) values('Recommendations');
insert into reminder.categories (value) values('Testing Registration');
