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


-- 3. Qué video corresponde a qué rutina -----------------------
-- Un video por DÍA de entrenamiento, no por ejercicio: la
-- entrenadora de Linda grabó la rutina completa de cada día
-- (lunes a viernes, más el complemento de abdominales).
--
-- La clave lleva el programa además del día porque los dos planes
-- usan letras distintas pero podrían coincidir a futuro; así el
-- video de una nunca aparece en la rutina del otro.
-- Se limpia la tabla del intento anterior, que iba por ejercicio.
drop table if exists public.ejercicio_videos;
drop table if exists public.rutina_videos;

create table public.rutina_videos (
  programa     text not null,
  dia_id       text not null,            -- LUN, MAR, MIE, JUE, VIE, ABD
  ruta         text not null,            -- dónde está el archivo en el depósito
  nombre       text not null default '', -- nombre original, para reconocerlo
  peso         bigint not null default 0,
  subido_por   uuid references auth.users on delete set null,
  actualizado  timestamptz not null default now(),
  primary key (programa, dia_id)
);

alter table public.rutina_videos enable row level security;

drop policy if exists "leer videos"     on public.rutina_videos;
drop policy if exists "guardar videos"  on public.rutina_videos;
drop policy if exists "editar videos"   on public.rutina_videos;
drop policy if exists "eliminar videos" on public.rutina_videos;

create policy "leer videos"     on public.rutina_videos for select to authenticated using (true);
create policy "guardar videos"  on public.rutina_videos for insert to authenticated with check (true);
create policy "editar videos"   on public.rutina_videos for update to authenticated using (true);
create policy "eliminar videos" on public.rutina_videos for delete to authenticated using (true);

grant select, insert, update, delete on public.rutina_videos to authenticated;
