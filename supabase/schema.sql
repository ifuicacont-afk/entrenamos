-- ============================================================
-- Entrenamos — esquema de base de datos
-- Correr en Supabase > SQL Editor > New query
-- ============================================================
-- Row Level Security está activo en todas las tablas.
-- Cada usuario solo puede leer y escribir sus propias filas.
-- Esto es lo que hace que el perfil de uno sea inaccesible para el otro,
-- incluso si alguien obtiene la anon key (que es pública por diseño).
-- ============================================================

-- Perfil ------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text not null default '',
  program     text not null default 'ignacio' check (program in ('ignacio', 'linda')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "leer mi perfil"     on public.profiles for select using (auth.uid() = id);
create policy "crear mi perfil"    on public.profiles for insert with check (auth.uid() = id);
create policy "editar mi perfil"   on public.profiles for update using (auth.uid() = id);

-- Crear el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, program)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'program', 'ignacio')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Sesiones de entrenamiento -----------------------------------
-- client_id lo genera la app en el teléfono. Sirve para que, si una
-- sesión se manda dos veces (por ejemplo al recuperar la señal), quede
-- una sola fila en vez de duplicarse.
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  client_id   text not null,
  date        date not null,
  day_id      text not null,
  name        text not null default '',
  mins        integer not null default 0,
  exercises   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists sessions_user_date_idx on public.sessions (user_id, date desc);
alter table public.sessions enable row level security;

create policy "leer mis sesiones"     on public.sessions for select using (auth.uid() = user_id);
create policy "crear mis sesiones"    on public.sessions for insert with check (auth.uid() = user_id);
create policy "editar mis sesiones"   on public.sessions for update using (auth.uid() = user_id);
create policy "borrar mis sesiones"   on public.sessions for delete using (auth.uid() = user_id);


-- Peso de trabajo por ejercicio -------------------------------
create table if not exists public.exercise_weights (
  user_id      uuid not null references auth.users on delete cascade,
  exercise_id  text not null,
  kg           numeric(5,1) not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

alter table public.exercise_weights enable row level security;

create policy "leer mis pesos"    on public.exercise_weights for select using (auth.uid() = user_id);
create policy "guardar mis pesos" on public.exercise_weights for insert with check (auth.uid() = user_id);
create policy "editar mis pesos"  on public.exercise_weights for update using (auth.uid() = user_id);


-- Peso corporal -----------------------------------------------
create table if not exists public.body_weight (
  user_id  uuid not null references auth.users on delete cascade,
  date     date not null,
  kg       numeric(5,2) not null,
  primary key (user_id, date)
);

alter table public.body_weight enable row level security;

create policy "leer mi peso"    on public.body_weight for select using (auth.uid() = user_id);
create policy "anotar mi peso"  on public.body_weight for insert with check (auth.uid() = user_id);
create policy "editar mi peso"  on public.body_weight for update using (auth.uid() = user_id);
create policy "borrar mi peso"  on public.body_weight for delete using (auth.uid() = user_id);


-- Cardio (bici, remo, caminata) -------------------------------
create table if not exists public.cardio (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  client_id  text not null,
  date       date not null,
  mins       integer not null,
  kind       text not null default 'cardio',
  unique (user_id, client_id)
);

create index if not exists cardio_user_date_idx on public.cardio (user_id, date desc);
alter table public.cardio enable row level security;

create policy "leer mi cardio"    on public.cardio for select using (auth.uid() = user_id);
create policy "anotar mi cardio"  on public.cardio for insert with check (auth.uid() = user_id);
create policy "editar mi cardio"  on public.cardio for update using (auth.uid() = user_id);
create policy "borrar mi cardio"  on public.cardio for delete using (auth.uid() = user_id);


-- Comidas y suplementos del día -------------------------------
create table if not exists public.daily_checks (
  user_id  uuid not null references auth.users on delete cascade,
  date     date not null,
  meals    jsonb not null default '{}'::jsonb,
  supps    jsonb not null default '{}'::jsonb,
  primary key (user_id, date)
);

alter table public.daily_checks enable row level security;

create policy "leer mis marcas"    on public.daily_checks for select using (auth.uid() = user_id);
create policy "crear mis marcas"   on public.daily_checks for insert with check (auth.uid() = user_id);
create policy "editar mis marcas"  on public.daily_checks for update using (auth.uid() = user_id);


-- Permisos del API --------------------------------------------
-- Hacen falta DOS candados y cumplen papeles distintos:
--   · Las políticas RLS de arriba deciden QUÉ FILAS ve cada usuario.
--   · Estos permisos deciden QUÉ TABLAS puede tocar el API.
-- Sin este bloque, la app recibiría "permission denied" aunque el RLS
-- esté perfecto.
--
-- Se le dan solo a "authenticated" (alguien con sesión iniciada). El rol
-- "anon" (visitante sin cuenta) no recibe nada, porque la app pide entrar
-- antes de leer o escribir cualquier cosa.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles         to authenticated;
grant select, insert, update, delete on public.sessions         to authenticated;
grant select, insert, update, delete on public.exercise_weights to authenticated;
grant select, insert, update, delete on public.body_weight      to authenticated;
grant select, insert, update, delete on public.cardio           to authenticated;
grant select, insert, update, delete on public.daily_checks     to authenticated;
