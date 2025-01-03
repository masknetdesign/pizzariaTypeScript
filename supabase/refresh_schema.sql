-- Refresh the schema cache for the orders table
notify pgrst, 'reload schema';

-- Drop existing table and related objects
drop trigger if exists validate_order_items_trigger on public.orders;
drop function if exists validate_order_items();
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;
drop policy if exists "Users can update their own orders status" on public.orders;
drop table if exists public.orders;

-- Create orders table
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null,
    items jsonb not null,
    total decimal(10,2) not null,
    status text not null default 'pending',
    address jsonb not null,
    created_at timestamptz default now() not null,
    constraint fk_user foreign key (user_id) references auth.users(id) on delete cascade
);

-- Create indexes
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at desc);

-- Enable RLS
alter table public.orders enable row level security;

-- Create policies
create policy "Users can view their own orders"
    on public.orders for select
    using (auth.uid() = user_id);

create policy "Users can insert their own orders"
    on public.orders for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own orders"
    on public.orders for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';
