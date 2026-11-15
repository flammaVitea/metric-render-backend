ALTER TABLE public.users
  ADD COLUMN is_two_factor_enabled boolean NOT NULL DEFAULT false;
