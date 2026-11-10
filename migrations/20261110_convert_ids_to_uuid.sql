BEGIN;

LOCK TABLE
  public.organizations,
  public.users,
  public.dashboards,
  public.data_sources,
  public.charts
IN ACCESS EXCLUSIVE MODE;

CREATE TEMP TABLE uuid_id_map_organizations (
  old_id text PRIMARY KEY,
  new_id uuid NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMP TABLE uuid_id_map_users (
  old_id text PRIMARY KEY,
  new_id uuid NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMP TABLE uuid_id_map_dashboards (
  old_id text PRIMARY KEY,
  new_id uuid NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMP TABLE uuid_id_map_data_sources (
  old_id text PRIMARY KEY,
  new_id uuid NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMP TABLE uuid_id_map_charts (
  old_id text PRIMARY KEY,
  new_id uuid NOT NULL UNIQUE
) ON COMMIT DROP;

INSERT INTO uuid_id_map_organizations (old_id, new_id)
SELECT id, CASE
  WHEN id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN id::uuid
  ELSE gen_random_uuid()
END
FROM public.organizations;

INSERT INTO uuid_id_map_users (old_id, new_id)
SELECT id, CASE
  WHEN id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN id::uuid
  ELSE gen_random_uuid()
END
FROM public.users;

INSERT INTO uuid_id_map_dashboards (old_id, new_id)
SELECT id, CASE
  WHEN id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN id::uuid
  ELSE gen_random_uuid()
END
FROM public.dashboards;

INSERT INTO uuid_id_map_data_sources (old_id, new_id)
SELECT id, CASE
  WHEN id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN id::uuid
  ELSE gen_random_uuid()
END
FROM public.data_sources;

INSERT INTO uuid_id_map_charts (old_id, new_id)
SELECT id, CASE
  WHEN id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN id::uuid
  ELSE gen_random_uuid()
END
FROM public.charts;

CREATE TEMP TABLE uuid_json_maps (
  entity text PRIMARY KEY,
  mapping jsonb NOT NULL
) ON COMMIT DROP;

INSERT INTO uuid_json_maps (entity, mapping)
SELECT 'data_sources', COALESCE(jsonb_object_agg(old_id, new_id::text), '{}'::jsonb)
FROM uuid_id_map_data_sources
UNION ALL
SELECT 'charts', COALESCE(jsonb_object_agg(old_id, new_id::text), '{}'::jsonb)
FROM uuid_id_map_charts;

CREATE FUNCTION pg_temp.remap_jsonb_ids(document jsonb, mappings jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  remapped jsonb;
BEGIN
  IF document IS NULL THEN
    RETURN NULL;
  END IF;

  CASE jsonb_typeof(document)
    WHEN 'object' THEN
      SELECT COALESCE(
        jsonb_object_agg(
          entry.key,
          pg_temp.remap_jsonb_ids(entry.value, mappings)
        ),
        '{}'::jsonb
      )
      INTO remapped
      FROM jsonb_each(document) AS entry;
      RETURN remapped;
    WHEN 'array' THEN
      SELECT COALESCE(
        jsonb_agg(pg_temp.remap_jsonb_ids(entry.value, mappings)),
        '[]'::jsonb
      )
      INTO remapped
      FROM jsonb_array_elements(document) AS entry(value);
      RETURN remapped;
    WHEN 'string' THEN
      RETURN COALESCE(mappings -> (document #>> '{}'), document);
    ELSE
      RETURN document;
  END CASE;
END;
$$;

UPDATE public.charts AS chart
SET source_ids = pg_temp.remap_jsonb_ids(
  chart.source_ids,
  (SELECT mapping FROM uuid_json_maps WHERE entity = 'data_sources')
);

UPDATE public.dashboards AS dashboard
SET charts_order = pg_temp.remap_jsonb_ids(
  dashboard.charts_order,
  (SELECT mapping FROM uuid_json_maps WHERE entity = 'charts')
);

UPDATE public.users AS target
SET organization_id = mapping.new_id::text
FROM uuid_id_map_organizations AS mapping
WHERE target.organization_id = mapping.old_id;

UPDATE public.dashboards AS target
SET user_id = mapping.new_id::text
FROM uuid_id_map_users AS mapping
WHERE target.user_id = mapping.old_id;

UPDATE public.data_sources AS target
SET user_id = mapping.new_id::text
FROM uuid_id_map_users AS mapping
WHERE target.user_id = mapping.old_id;

UPDATE public.charts AS target
SET dashboard_id = mapping.new_id::text
FROM uuid_id_map_dashboards AS mapping
WHERE target.dashboard_id = mapping.old_id;

UPDATE public.charts AS target
SET user_id = mapping.new_id::text
FROM uuid_id_map_users AS mapping
WHERE target.user_id = mapping.old_id;

UPDATE public.organizations AS target
SET id = mapping.new_id::text
FROM uuid_id_map_organizations AS mapping
WHERE target.id = mapping.old_id;

UPDATE public.users AS target
SET id = mapping.new_id::text
FROM uuid_id_map_users AS mapping
WHERE target.id = mapping.old_id;

UPDATE public.dashboards AS target
SET id = mapping.new_id::text
FROM uuid_id_map_dashboards AS mapping
WHERE target.id = mapping.old_id;

UPDATE public.data_sources AS target
SET id = mapping.new_id::text
FROM uuid_id_map_data_sources AS mapping
WHERE target.id = mapping.old_id;

UPDATE public.charts AS target
SET id = mapping.new_id::text
FROM uuid_id_map_charts AS mapping
WHERE target.id = mapping.old_id;

ALTER TABLE public.organizations
  ALTER COLUMN id TYPE uuid USING id::uuid;

ALTER TABLE public.users
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN organization_id TYPE uuid USING organization_id::uuid;

ALTER TABLE public.dashboards
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.data_sources
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE public.charts
  ALTER COLUMN id TYPE uuid USING id::uuid,
  ALTER COLUMN dashboard_id TYPE uuid USING dashboard_id::uuid,
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

COMMIT;
