create table logs(
  id serial primary key not null,
  subject log_type,
  -- TODO: Should we have a memberid reference for this?
  -- If not do we want to capture other data?
  entry text not null,
  data json,
  created_at timestamptz default current_timestamp
);
