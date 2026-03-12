-- ============================================================
-- orders RLS policies fix
-- Run this entire script in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → Paste → Run)
--
-- User model used:
--   Internal employees  → authenticated users with NO row in client_workers
--   External clients    → authenticated users WITH a row in client_workers
-- ============================================================


-- ============================================================
-- 1. Drop all existing policies on orders
-- ============================================================
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users"           ON public.orders;
DROP POLICY IF EXISTS "Policy with table joins"                    ON public.orders;

-- Safety: drop any other policies that might exist under different names
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
  END LOOP;
END $$;


-- ============================================================
-- 2. Ensure RLS is enabled on orders
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. INSERT
--    Only internal employees (NOT in client_workers) may create orders.
-- ============================================================
CREATE POLICY "Employees can insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id = auth.uid()
    )
  );


-- ============================================================
-- 4. SELECT – internal employees see ALL orders
-- ============================================================
CREATE POLICY "Employees can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id = auth.uid()
    )
  );


-- ============================================================
-- 5. SELECT – external clients see ONLY their own orders
-- ============================================================
CREATE POLICY "Clients can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id   = auth.uid()
        AND client_workers.client_id = orders.client_id
    )
  );


-- ============================================================
-- 6. UPDATE – internal employees can update any order
-- ============================================================
CREATE POLICY "Employees can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    NOT EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id = auth.uid()
    )
  );


-- ============================================================
-- 7. UPDATE – external clients can update ONLY their own orders
-- ============================================================
CREATE POLICY "Clients can update own orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id   = auth.uid()
        AND client_workers.client_id = orders.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id   = auth.uid()
        AND client_workers.client_id = orders.client_id
    )
  );


-- ============================================================
-- 8. DELETE – only internal employees can delete orders
-- ============================================================
CREATE POLICY "Employees can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.client_workers
      WHERE client_workers.user_id = auth.uid()
    )
  );


-- ============================================================
-- 9. (Optional safety) Ensure client_workers has a SELECT policy
--    so authenticated users can at least read their own row.
--    Skip this block if client_workers does not have RLS enabled.
-- ============================================================
-- If you want to enable RLS on client_workers too, uncomment below:
--
-- ALTER TABLE public.client_workers ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view their own client_worker record"
--   ON public.client_workers
--   FOR SELECT
--   TO authenticated
--   USING (user_id = auth.uid());
