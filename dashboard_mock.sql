-- PostgreSQL 16
-- 1) Створи БД окремо:
--    CREATE DATABASE dashboard_mock WITH ENCODING 'UTF8';
-- 2) Підключись до dashboard_mock і виконай цей файл:
--    psql -U postgres -d dashboard_mock -f dashboard_mock.sql
--
-- Пароль admin/admin залишено лише для відтворення мокових даних.
-- У реальному застосунку зберігай пароль у вигляді хешу (наприклад, Argon2id).

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    username     TEXT NOT NULL UNIQUE,
    password     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sources (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    type           TEXT NOT NULL CHECK (type IN ('rest', 'csv')),
    url_or_path    TEXT NOT NULL,
    status         TEXT,
    last_sync      TIMESTAMPTZ,
    visible_fields JSONB,
    hidden_fields  JSONB,
    user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CHECK (visible_fields IS NULL OR jsonb_typeof(visible_fields) = 'array'),
    CHECK (hidden_fields IS NULL OR jsonb_typeof(hidden_fields) = 'array')
);

CREATE TABLE IF NOT EXISTS dashboards (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    section_order JSONB NOT NULL DEFAULT '[]'::jsonb,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CHECK (jsonb_typeof(section_order) = 'array')
);

CREATE TABLE IF NOT EXISTS charts (
    id            TEXT PRIMARY KEY,
    dashboard_id  TEXT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    source_ids    JSONB NOT NULL DEFAULT '[]'::jsonb,
    section       TEXT,
    title         TEXT NOT NULL,
    type          TEXT NOT NULL,
    x_axis_field  TEXT,
    y_axis_field  TEXT,
    color         TEXT,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    CHECK (jsonb_typeof(source_ids) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_dashboard_id ON charts(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_charts_user_id ON charts(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_source_ids ON charts USING GIN(source_ids);

INSERT INTO users (id, username, password)
VALUES ('admin', 'admin', 'admin')
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password;

INSERT INTO data_sources
    (id, name, type, url_or_path, status, last_sync, visible_fields, hidden_fields, user_id)
VALUES
    ('jSI5xEh713o', 'sales-v1', 'rest', 'http://localhost:3001/sales',
     NULL, NULL, '["month","revenue","orders"]'::jsonb, '["id"]'::jsonb, 'admin'),
    ('0ik55QfwBB0', 'Тест 2', 'rest', 'http://localhost:3001/users-demographics',
     NULL, NULL, '["category","count"]'::jsonb, '["id"]'::jsonb, 'admin'),
    ('NJniqTy2UMY', 'sensors-v1', 'rest', 'http://localhost:3001/sensors',
     NULL, NULL, NULL, NULL, 'admin'),
    ('yTwbsfroHv0', 'тест', 'csv', 'halych.csv',
     'pending', '2026-10-22T09:19:46.462Z'::timestamptz,
     '["Місяць","Дохід","Витрати","Клієнти"]'::jsonb, '[]'::jsonb, 'admin'),
    ('6YR96yl15oA', 'sales-v2', 'rest', 'http://localhost:3002/sales',
     'pending', '2026-10-23T05:18:59.043Z'::timestamptz,
     '["month","revenue","orders"]'::jsonb, '["id"]'::jsonb, 'admin')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    url_or_path = EXCLUDED.url_or_path,
    status = EXCLUDED.status,
    last_sync = EXCLUDED.last_sync,
    visible_fields = EXCLUDED.visible_fields,
    hidden_fields = EXCLUDED.hidden_fields,
    user_id = EXCLUDED.user_id;

INSERT INTO dashboards (id, name, section_order, user_id)
VALUES (
    '_mYl8nJV5hc',
    'Test',
    '["Загальний","Test"]'::jsonb,
    'admin'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    section_order = EXCLUDED.section_order,
    user_id = EXCLUDED.user_id;

-- sourceId у вихідному моку нормалізовано до source_ids:
-- одиночний sourceId стає масивом з одного елемента.
-- Якщо в об'єкті немає section, у БД залишається NULL.
INSERT INTO charts
    (id, dashboard_id, source_ids, section, title, type, x_axis_field, y_axis_field, color, user_id)
VALUES
    ('BxbAp9pt7ms', '_mYl8nJV5hc',
     '["jSI5xEh713o","6YR96yl15oA"]'::jsonb, 'Загальний',
     'Новий графік', 'bar', 'month', 'revenue', '#1890ff', 'admin'),
    ('KWTGr4wWD8I', '_mYl8nJV5hc',
     '["jSI5xEh713o"]'::jsonb, NULL,
     'Новий графік', 'bar', 'month', 'revenue', '#1890ff', 'admin'),
    ('YlE1BNVNOWM', '_mYl8nJV5hc',
     '["jSI5xEh713o"]'::jsonb, NULL,
     'Новий графік 1', 'pie', 'month', 'revenue', '#1890ff', 'admin'),
    ('CrzHSlc5QHU', '_mYl8nJV5hc',
     '["jSI5xEh713o"]'::jsonb, 'Test',
     'Новий графік', 'bar', 'month', 'revenue', '#0084ff', 'admin'),
    ('7h_GciohFKM', '_mYl8nJV5hc',
     '["jSI5xEh713o","6YR96yl15oA"]'::jsonb, 'Загальний',
     'Новий графік', 'bar', 'month', 'revenue', '#1890ff', 'admin'),
    ('r5z5FnBm184', '_mYl8nJV5hc',
     '["jSI5xEh713o"]'::jsonb, 'Test',
     'Новий графік', 'bar', 'month', 'revenue', '#1890ff', 'admin'),
    ('y9593pE', '_mYl8nJV5hc',
     '["0ik55QfwBB0"]'::jsonb, 'Test',
     'Новий графік', 'bar', 'category', 'count', '#000b14', 'admin')
ON CONFLICT (id) DO UPDATE SET
    dashboard_id = EXCLUDED.dashboard_id,
    source_ids = EXCLUDED.source_ids,
    section = EXCLUDED.section,
    title = EXCLUDED.title,
    type = EXCLUDED.type,
    x_axis_field = EXCLUDED.x_axis_field,
    y_axis_field = EXCLUDED.y_axis_field,
    color = EXCLUDED.color,
    user_id = EXCLUDED.user_id;

COMMIT;

-- Перевірка імпортованих записів:
-- SELECT * FROM users;
-- SELECT id, name, type, url_or_path FROM data_sources ORDER BY id;
-- SELECT * FROM dashboards;
-- SELECT id, title, type, source_ids FROM charts ORDER BY id;
