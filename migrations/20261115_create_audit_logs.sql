CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'LOCKED_OUT')),
  "ipAddress" text,
  created_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid
);

CREATE INDEX IDX_audit_logs_organization_created_at
  ON public.audit_logs (organization_id, created_at DESC);
