alter policy "Allow users full access to their own completed projects"
on "public"."completed_projects"
to public
using (
  (supabase_uid = auth.uid())
) with check (
  (supabase_uid = auth.uid())
);