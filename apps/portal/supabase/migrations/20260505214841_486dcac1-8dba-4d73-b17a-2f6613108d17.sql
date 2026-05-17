
REVOKE EXECUTE ON FUNCTION public.set_admin_role_by_email(TEXT, BOOLEAN) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.list_admins() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_role_by_email(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;
