-- Remover objetos existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_created() CASCADE;
DROP TABLE IF EXISTS public.profiles;

-- Criar tabela de perfis
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Permitir leitura para todos os usuários autenticados"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Permitir inserção para qualquer usuário autenticado
CREATE POLICY "Permitir inserção para usuários autenticados"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Permitir atualização pelo próprio usuário
CREATE POLICY "Permitir atualização pelo próprio usuário"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    profile_exists boolean;
BEGIN
    -- Log do início da função
    RAISE NOTICE 'Iniciando handle_new_user para usuário %', NEW.id;

    -- Check if profile already exists
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = NEW.id
    ) INTO profile_exists;

    -- Log do resultado da verificação
    RAISE NOTICE 'Perfil existe? %', profile_exists;

    -- Only create profile if it doesn't exist
    IF NOT profile_exists THEN
        -- Log dos dados que serão inseridos
        RAISE NOTICE 'Inserindo novo perfil com id: %, name: %, email: %', 
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NEW.email;

        INSERT INTO public.profiles (id, name, email)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NEW.email
        );

        -- Log do sucesso da inserção
        RAISE NOTICE 'Perfil criado com sucesso';
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log de qualquer erro que ocorra
    RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Conceder permissões
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Reset ownership
ALTER TABLE public.profiles OWNER TO postgres;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.handle_updated_at() OWNER TO postgres;

-- Adicionar comentários
COMMENT ON TABLE public.profiles IS 'Perfis de usuário';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário referenciando auth.users';
COMMENT ON COLUMN public.profiles.name IS 'Nome do usuário';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização do perfil';
