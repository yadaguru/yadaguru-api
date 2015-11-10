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
