--kill the membership schema, tables, and functions
drop schema if exists reminder CASCADE;

--good to use a schema to keep your tables, views, functions
--organized and confined
create schema reminder;

--set this so what we create here will be applied to the membership schema
set search_path=reminder;

--global functions

--log enum
-- TODO: Flesh out log_type
create type log_type as ENUM('system');
-- TODO: log level enum, error, ect.

--type for reminder summary
-- TODO: Write reminder_summary

select 'DB Initialized' as result;
