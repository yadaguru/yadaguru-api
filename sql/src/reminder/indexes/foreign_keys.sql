set search_path = reminder;

ALTER TABLE reminders_timeframes
ADD CONSTRAINT reminder_timeframes_timeframes
FOREIGN KEY (timeframe_id) REFERENCES timeframes (id) on delete casade;

ALTER TABLE reminders_timeframes
ADD CONSTRAINT reminder_timeframes_reminders
FOREIGN KEY (reminder_id) REFERENCES reminders (id) on delete casade;
