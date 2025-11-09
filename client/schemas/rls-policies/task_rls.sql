alter policy "Allow users full access to their own tasks"
on "public"."task"
to public
using (
  (supabase_uid = auth.uid())
) with check (
  (supabase_uid = auth.uid())
);