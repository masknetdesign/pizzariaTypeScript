-- Remover objetos existentes
DROP TRIGGER IF EXISTS validate_order_items_trigger ON public.orders;
DROP FUNCTION IF EXISTS validate_order_items();
DROP TABLE IF EXISTS public.orders;

-- Criar tabela de pedidos
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    address JSONB NOT NULL,
    payment_status TEXT DEFAULT 'pending'
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados"
ON public.orders
FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.uid() = id 
        AND raw_user_meta_data->>'is_admin' = 'true'
    )
);

-- Criar política para permitir inserção pelo usuário autenticado
CREATE POLICY "Permitir inserção pelo usuário"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para permitir atualização pelo usuário ou admin
CREATE POLICY "Permitir atualização pelo usuário ou admin"
ON public.orders
FOR UPDATE
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.uid() = id 
        AND raw_user_meta_data->>'is_admin' = 'true'
    )
)
WITH CHECK (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.uid() = id 
        AND raw_user_meta_data->>'is_admin' = 'true'
    )
);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para buscar pedidos com informações do usuário
CREATE OR REPLACE FUNCTION public.get_orders_with_user_info(status_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    items JSONB,
    total NUMERIC,
    status TEXT,
    payment_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    address JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.user_id,
        p.name as user_name,
        p.email as user_email,
        o.items,
        o.total,
        o.status,
        o.payment_status,
        o.created_at,
        o.updated_at,
        o.address
    FROM public.orders o
    JOIN public.profiles p ON o.user_id = p.id
    WHERE (status_filter IS NULL OR o.status = status_filter)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE public.orders IS 'Tabela de pedidos';
COMMENT ON COLUMN public.orders.id IS 'Identificador único do pedido';
COMMENT ON COLUMN public.orders.user_id IS 'Referência ao usuário que fez o pedido';
COMMENT ON COLUMN public.orders.items IS 'Array de itens do pedido com produto_id, quantidade e preço';
COMMENT ON COLUMN public.orders.total IS 'Valor total do pedido';
COMMENT ON COLUMN public.orders.status IS 'Status atual do pedido';
COMMENT ON COLUMN public.orders.address IS 'Detalhes do endereço de entrega';
COMMENT ON COLUMN public.orders.created_at IS 'Data e hora em que o pedido foi criado';
COMMENT ON COLUMN public.orders.updated_at IS 'Data e hora em que o pedido foi atualizado';
COMMENT ON COLUMN public.orders.payment_status IS 'Status do pagamento do pedido';

-- Conceder permissões
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
