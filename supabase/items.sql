-- Remover objetos existentes
DROP TABLE IF EXISTS public.items;

-- Criar tabela de itens
CREATE TABLE public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC NOT NULL,
    size TEXT NOT NULL,
    edge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_items_order_id ON public.items(order_id);
CREATE INDEX idx_items_product_id ON public.items(product_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados"
ON public.items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE public.orders.id = order_id
        AND public.orders.user_id = auth.uid()
    )
);

-- Criar política para permitir inserção pelo usuário autenticado
CREATE POLICY "Permitir inserção para usuários"
ON public.items
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE public.orders.id = order_id
        AND public.orders.user_id = auth.uid()
    )
);

-- Criar política para permitir atualização pelo usuário ou admin
CREATE POLICY "Permitir atualização para usuários ou admin"
ON public.items
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE public.orders.id = order_id
        AND (public.orders.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'))
    )
);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION public.update_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_items_updated_at();
