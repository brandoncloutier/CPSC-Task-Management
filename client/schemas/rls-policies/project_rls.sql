alter policy "Allow users full access to their own project"
on "public"."project"
to public
using (
  (supabase_uid = auth.uid())
) with check (
  (supabase_uid = auth.uid())
);