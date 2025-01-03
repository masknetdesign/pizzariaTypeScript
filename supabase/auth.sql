-- Remover usuários existentes para começar limpo
truncate auth.users cascade;

-- Desabilitar confirmação de email
alter table auth.users
alter column email_confirmed_at
set default now();

-- Atualizar usuários existentes
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

-- Adicionar trigger para garantir que email_confirmed_at seja sempre preenchido
create or replace function auth.ensure_email_confirmed()
returns trigger as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists ensure_email_confirmed_trigger on auth.users;
create trigger ensure_email_confirmed_trigger
before insert or update on auth.users
for each row
execute function auth.ensure_email_confirmed();

-- Dar permissões necessárias
grant usage on schema auth to postgres, authenticated, anon, service_role;
grant all on all tables in schema auth to postgres, service_role;
grant all on all sequences in schema auth to postgres, service_role;
grant all on all routines in schema auth to postgres, service_role;

-- Dar permissões específicas para auth.users
grant select on auth.users to authenticated;
grant select on auth.users to anon;
grant insert, update on auth.users to service_role;

-- Criar função para buscar usuário por email
create or replace function auth.get_user_by_email(email text)
returns auth.users
language sql
security definer
set search_path = auth
as $$
  select *
  from auth.users
  where users.email = email
  limit 1;
$$;

-- Dar permissão para executar a função
grant execute on function auth.get_user_by_email(text) to anon, authenticated, service_role;

-- Recarregar as permissões
alter table auth.users owner to supabase_auth_admin;
