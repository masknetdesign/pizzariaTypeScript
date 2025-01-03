-- Create addresses table
create table if not exists public.addresses (
    id bigint generated by default as identity primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    street text not null,
    number text not null,
    complement text,
    neighborhood text not null,
    city text not null,
    state text not null,
    postal_code text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.addresses enable row level security;

-- Create policies
create policy "Users can view own addresses"
    on addresses for select
    using (auth.uid() = user_id);

create policy "Users can insert own addresses"
    on addresses for insert
    with check (auth.uid() = user_id);

create policy "Users can update own addresses"
    on addresses for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own addresses"
    on addresses for delete
    using (auth.uid() = user_id);

-- Create indexes
create index addresses_user_id_idx on addresses(user_id);
create index addresses_postal_code_idx on addresses(postal_code);

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger handle_addresses_updated_at
    before update on addresses
    for each row
    execute procedure public.handle_updated_at();
