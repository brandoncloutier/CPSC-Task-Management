select
  cron.schedule (
    'invoke-function-every-minute',
    '* * * * *', -- every minute
    $$
    select
  net.http_post(
    url := 'https://jwymozsdutaedjklyspu.supabase.co/functions/v1/recurring-task-checker',
    headers := '{
      "Content-Type": "application/json",
      "Authorization": "Bearer sb_publishable_RKpKQ9l82bIEX4Yu7RgHKg_wl_xNSuL",
      "apikey": "sb_publishable_RKpKQ9l82bIEX4Yu7RgHKg_wl_xNSuL"
    }'::jsonb,
    body := '{"name":"Functions"}'::jsonb
  ) as request_id;
    $$
  );