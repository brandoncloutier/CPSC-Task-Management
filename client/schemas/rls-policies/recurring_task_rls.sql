alter policy "Allow users full access to their own recurring tasks"
on "public"."recurring_task"
to public
using (
  (supabase_uid = auth.uid())
) with check (
  (supabase_uid = auth.uid())
);