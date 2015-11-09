create table faqs(
  id serial primary key not null,
  question text unique,
  answer text
);
