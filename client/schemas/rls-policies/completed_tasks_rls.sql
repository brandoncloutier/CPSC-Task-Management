alter policy "Allow users full access to their own completed tasks"
on "public"."completed_tasks"
to public
using (
  (supabase_uid = auth.uid())
) with check (
  (supabase_uid = auth.uid())
);