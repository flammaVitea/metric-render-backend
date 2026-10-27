-- Run once against existing databases before deploying the email-based application.
BEGIN;

ALTER TABLE users RENAME COLUMN username TO email;

COMMIT;
