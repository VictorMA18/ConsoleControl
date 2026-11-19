-- Datos iniciales que llegaron después de instalar la app en algunos celulares, porque seedData.ts
-- solo se carga con la base vacía. Todo con INSERT OR IGNORE y los mismos id fijos: si ya existe,
-- no cambia nada.
--
-- 1. La PS3 (MAQ #1) se agregó a los datos iniciales en T13. Los celulares instalados antes nunca la
-- recibieron, porque esos datos solo se cargan con la base vacía. Se inserta si falta, con sus
-- 4 mandos y los mismos id fijos de seedData.ts; si ya existe, no cambia nada. Sus tarifas ya
-- llegaron con la migración 0001.
INSERT OR IGNORE INTO `consoles` (`id`, `name`, `console_type`, `status`, `usage_minutes`, `created_at`, `updated_at`, `sync_status`)
VALUES ('2c26a7b0-b208-44c7-b905-8de14c44db65', 'MAQ #1', 'ps3', 'disponible', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente');--> statement-breakpoint
INSERT OR IGNORE INTO `controllers` (`id`, `console_id`, `label`, `status`, `usage_minutes`, `created_at`, `updated_at`, `sync_status`)
VALUES
  ('f94cc95a-4a4b-48a6-b88d-edfbcf8ddd67', '2c26a7b0-b208-44c7-b905-8de14c44db65', 'Mando 1', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente'),
  ('437ce38b-138f-4c95-a643-b50d17cd7654', '2c26a7b0-b208-44c7-b905-8de14c44db65', 'Mando 2', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente'),
  ('15a1f523-3809-4d11-bb31-72b5f717888a', '2c26a7b0-b208-44c7-b905-8de14c44db65', 'Mando 3', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente'),
  ('5d454108-6993-4c8c-b811-e705402905ee', '2c26a7b0-b208-44c7-b905-8de14c44db65', 'Mando 4', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente');
--> statement-breakpoint
-- 2. En T12 la PS5 (MAQ #3) y la Switch (MAQ #5) pasaron de 4 a 6 mandos: se agregan el 5 y el 6.
INSERT OR IGNORE INTO `controllers` (`id`, `console_id`, `label`, `status`, `usage_minutes`, `created_at`, `updated_at`, `sync_status`)
VALUES
  ('d38c7046-aeab-4159-814d-fe3aa0e951ac', '551f976b-9f52-4e32-9db4-a2c938431f4f', 'Mando 5', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente'),
  ('f31160fd-d525-4245-98bc-95f17eac34dd', '551f976b-9f52-4e32-9db4-a2c938431f4f', 'Mando 6', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente'),
  ('f065090d-b1e5-4645-86b7-38d2894b58c2', 'fb64a232-3044-4929-99c9-8a0c7203cdac', 'Mando 5', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente'),
  ('7eacf674-d229-4ade-a606-09469292711b', 'fb64a232-3044-4929-99c9-8a0c7203cdac', 'Mando 6', 'operativo', 0, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000, 'pendiente');
