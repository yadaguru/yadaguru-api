set search_path = reminder;

--ALTER TABLE reminders_timeframes
--ADD CONSTRAINT reminder_timeframes_timeframes
--FOREIGN KEY (timeframe_id) REFERENCES timeframes (id) on delete cascade;

--ALTER TABLE reminders_timeframes
--ADD CONSTRAINT reminder_timeframes_reminders
--FOREIGN KEY (reminder_id) REFERENCES reminders (id) on delete cascade;

--ALTER TABLE reminders_categories
--ADD CONSTRAINT reminder_categories_categories
--FOREIGN KEY (category_id) REFERENCES categories (id) on delete cascade;

--ALTER TABLE reminders_categories
--ADD CONSTRAINT reminder_categories_reminders
--FOREIGN KEY (reminder_id) REFERENCES reminders (id) on delete cascade;
