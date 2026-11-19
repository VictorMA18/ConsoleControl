-- Esquema espejo de SQLite para el respaldo en Supabase (HU-008, ADR 0008 y ADR 0016).
-- Generado a partir de src/db/migrations/meta/0008_snapshot.json: mismas tablas y columnas que el
-- dispositivo, salvo sync_status, que solo tiene sentido en el teléfono.
--
-- Seguridad (ADR 0016): cada instalación inicia sesión anónima en Supabase Auth. Cada fila guarda
-- su dueño (owner_id = auth.uid()) y RLS solo deja leer, insertar y actualizar las filas propias.
-- No hay políticas de borrado: el respaldo nunca borra. La clave primaria es (owner_id, id) porque
-- las consolas, mandos y tarifas iniciales tienen el mismo id en todos los dispositivos.
--
-- Las horas son milisegundos desde 1970 (bigint), como en SQLite, y el dinero, céntimos enteros.
-- Se puede ejecutar más de una vez: crea solo lo que falta.

create table if not exists public.consoles (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  name text not null,
  console_type text not null,
  status text not null default 'disponible',
  usage_minutes bigint not null default 0,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id)
);
alter table public.consoles enable row level security;
revoke all on public.consoles from anon, authenticated;
grant select, insert, update on public.consoles to authenticated;
drop policy if exists consoles_select_own on public.consoles;
create policy consoles_select_own on public.consoles for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists consoles_insert_own on public.consoles;
create policy consoles_insert_own on public.consoles for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists consoles_update_own on public.consoles;
create policy consoles_update_own on public.consoles for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create table if not exists public.controllers (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  console_id uuid not null,
  label text not null,
  status text not null default 'operativo',
  usage_minutes bigint not null default 0,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id),
  foreign key (owner_id, console_id) references public.consoles (owner_id, id)
);
create index if not exists controllers_owner_console_id_idx on public.controllers (owner_id, console_id);
alter table public.controllers enable row level security;
revoke all on public.controllers from anon, authenticated;
grant select, insert, update on public.controllers to authenticated;
drop policy if exists controllers_select_own on public.controllers;
create policy controllers_select_own on public.controllers for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists controllers_insert_own on public.controllers;
create policy controllers_insert_own on public.controllers for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists controllers_update_own on public.controllers;
create policy controllers_update_own on public.controllers for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create table if not exists public.rates (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  console_type text not null,
  block_minutes bigint not null,
  price_cents bigint not null,
  extra_controller_cents bigint not null,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id)
);
alter table public.rates enable row level security;
revoke all on public.rates from anon, authenticated;
grant select, insert, update on public.rates to authenticated;
drop policy if exists rates_select_own on public.rates;
create policy rates_select_own on public.rates for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists rates_insert_own on public.rates;
create policy rates_insert_own on public.rates for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists rates_update_own on public.rates;
create policy rates_update_own on public.rates for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create table if not exists public.shifts (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  opened_at bigint not null,
  closed_at bigint,
  status text not null default 'abierto',
  cash_cents bigint,
  digital_cents bigint,
  credit_cents bigint,
  counted_cash_cents bigint,
  difference_cents bigint,
  balance text,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id)
);
alter table public.shifts enable row level security;
revoke all on public.shifts from anon, authenticated;
grant select, insert, update on public.shifts to authenticated;
drop policy if exists shifts_select_own on public.shifts;
create policy shifts_select_own on public.shifts for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists shifts_insert_own on public.shifts;
create policy shifts_insert_own on public.shifts for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists shifts_update_own on public.shifts;
create policy shifts_update_own on public.shifts for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create table if not exists public.sessions (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  console_id uuid not null,
  rate_snapshot jsonb not null default '[]'::jsonb,
  controller_count bigint not null,
  mode text not null,
  duration_ms bigint,
  started_at bigint not null,
  ended_at bigint,
  status text not null default 'activa',
  total_cents bigint not null,
  played_minutes bigint,
  charged_minutes bigint,
  penalty_cents bigint,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id),
  foreign key (owner_id, console_id) references public.consoles (owner_id, id)
);
create index if not exists sessions_owner_console_id_idx on public.sessions (owner_id, console_id);
alter table public.sessions enable row level security;
revoke all on public.sessions from anon, authenticated;
grant select, insert, update on public.sessions to authenticated;
drop policy if exists sessions_select_own on public.sessions;
create policy sessions_select_own on public.sessions for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists sessions_insert_own on public.sessions;
create policy sessions_insert_own on public.sessions for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists sessions_update_own on public.sessions;
create policy sessions_update_own on public.sessions for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create table if not exists public.session_extensions (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  session_id uuid not null,
  minutes bigint not null,
  previous_total_cents bigint not null,
  new_total_cents bigint not null,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id),
  foreign key (owner_id, session_id) references public.sessions (owner_id, id)
);
create index if not exists session_extensions_owner_session_id_idx on public.session_extensions (owner_id, session_id);
alter table public.session_extensions enable row level security;
revoke all on public.session_extensions from anon, authenticated;
grant select, insert, update on public.session_extensions to authenticated;
drop policy if exists session_extensions_select_own on public.session_extensions;
create policy session_extensions_select_own on public.session_extensions for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists session_extensions_insert_own on public.session_extensions;
create policy session_extensions_insert_own on public.session_extensions for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists session_extensions_update_own on public.session_extensions;
create policy session_extensions_update_own on public.session_extensions for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create table if not exists public.payments (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  session_id uuid not null,
  method text not null,
  amount_cents bigint not null,
  customer_name text,
  shift_id uuid,
  modified_at bigint,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id),
  foreign key (owner_id, session_id) references public.sessions (owner_id, id),
  foreign key (owner_id, shift_id) references public.shifts (owner_id, id)
);
create index if not exists payments_owner_session_id_idx on public.payments (owner_id, session_id);
create index if not exists payments_owner_shift_id_idx on public.payments (owner_id, shift_id);
alter table public.payments enable row level security;
revoke all on public.payments from anon, authenticated;
grant select, insert, update on public.payments to authenticated;
drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists payments_insert_own on public.payments;
create policy payments_insert_own on public.payments for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists payments_update_own on public.payments;
create policy payments_update_own on public.payments for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create table if not exists public.maintenances (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id uuid not null,
  console_id uuid not null,
  kind text not null,
  usage_minutes_at bigint not null,
  performed_at bigint not null,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (owner_id, id),
  foreign key (owner_id, console_id) references public.consoles (owner_id, id)
);
create index if not exists maintenances_owner_console_id_idx on public.maintenances (owner_id, console_id);
alter table public.maintenances enable row level security;
revoke all on public.maintenances from anon, authenticated;
grant select, insert, update on public.maintenances to authenticated;
drop policy if exists maintenances_select_own on public.maintenances;
create policy maintenances_select_own on public.maintenances for select to authenticated
  using ((select auth.uid()) = owner_id);
drop policy if exists maintenances_insert_own on public.maintenances;
create policy maintenances_insert_own on public.maintenances for insert to authenticated
  with check ((select auth.uid()) = owner_id);
drop policy if exists maintenances_update_own on public.maintenances;
create policy maintenances_update_own on public.maintenances for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
