-- ============================================================
-- Entrenamos — videos de ejercicios
-- Correr en Supabase > SQL Editor > New query
-- ============================================================
-- Guarda los videos que la entrenadora de Linda mandó, para poder
-- verlos dentro de la app mientras se entrena.
--
-- A diferencia del resto de las tablas, estos NO son privados de cada
-- cuenta: son material compartido. Ignacio necesita poder cargarlos y
-- Linda verlos. Por eso las políticas piden "estar con la sesión
-- iniciada" y no "ser el dueño de la fila".
--
-- Eso es seguro porque solo existen dos cuentas y el registro queda
-- cerrado. Los datos personales (peso, comidas, sesiones) siguen
-- aislados por usuario como estaban.
-- ============================================================


-- 1. El depósito de archivos -----------------------------------
-- Privado: nadie puede adivinar una URL y ver los videos. La app pide
-- un enlace temporal cada vez que hay que reproducir uno.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  false,
  104857600,  -- 100 MB por archivo
  array['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
)
on conflict (id) do update
  set file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- 2. Quién puede tocar esos archivos ---------------------------
drop policy if exists "ver videos"    on storage.objects;
drop policy if exists "subir videos"  on storage.objects;
drop policy if exists "borrar videos" on storage.objects;

create policy "ver videos" on storage.objects
  for select to authenticated
  using (bucket_id = 'videos');

create policy "subir videos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'videos');

create policy "borrar videos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'videos');


-- 3. Qué video corresponde a qué ejercicio ---------------------
create table if not exists public.ejercicio_videos (
  ejercicio_id  text primary key,
  programa      text not null default 'linda',
  ruta          text not null,          -- dónde está el archivo en el depósito
  nombre        text not null default '', -- nombre original, para reconocerlo
  peso          bigint not null default 0,
  subido_por    uuid references auth.users on delete set null,
  actualizado   timestamptz not null default now()
);

alter table public.ejercicio_videos enable row level security;

drop policy if exists "leer videos"     on public.ejercicio_videos;
drop policy if exists "guardar videos"  on public.ejercicio_videos;
drop policy if exists "editar videos"   on public.ejercicio_videos;
drop policy if exists "eliminar videos" on public.ejercicio_videos;

create policy "leer videos"     on public.ejercicio_videos for select to authenticated using (true);
create policy "guardar videos"  on public.ejercicio_videos for insert to authenticated with check (true);
create policy "editar videos"   on public.ejercicio_videos for update to authenticated using (true);
create policy "eliminar videos" on public.ejercicio_videos for delete to authenticated using (true);

grant select, insert, update, delete on public.ejercicio_videos to authenticated;
