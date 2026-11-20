-- T13: tarifas por bloque de tiempo (15, 30, 45, 60 y 120 min) y copia de las tarifas en la sesión
-- (RN-08). Primero se recrea sessions sin la referencia a rates, luego se reemplaza rates.
-- Las tarifas anteriores eran provisionales: seed.ts carga las nuevas al abrir la app.
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`console_id` text NOT NULL,
	`rate_snapshot` text DEFAULT '[]' NOT NULL,
	`controller_count` integer NOT NULL,
	`mode` text NOT NULL,
	`duration_ms` integer,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`status` text DEFAULT 'activa' NOT NULL,
	`total_cents` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL,
	FOREIGN KEY (`console_id`) REFERENCES `consoles`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "sessions_controller_count_check" CHECK(controller_count BETWEEN 1 AND 6),
	CONSTRAINT "sessions_duration_ms_check" CHECK((mode = 'libre' AND duration_ms IS NULL) OR (mode <> 'libre' AND duration_ms > 0))
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "console_id", "controller_count", "mode", "duration_ms", "started_at", "ended_at", "status", "total_cents", "created_at", "updated_at", "sync_status") SELECT "id", "console_id", "controller_count", "mode", "duration_ms", "started_at", "ended_at", "status", "total_cents", "created_at", "updated_at", "sync_status" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE INDEX `sessions_console_id_status_idx` ON `sessions` (`console_id`,`status`);--> statement-breakpoint
CREATE INDEX `sessions_sync_status_idx` ON `sessions` (`sync_status`);--> statement-breakpoint
DROP TABLE `rates`;--> statement-breakpoint
CREATE TABLE `rates` (
	`id` text PRIMARY KEY NOT NULL,
	`console_type` text NOT NULL,
	`block_minutes` integer NOT NULL,
	`price_cents` integer NOT NULL,
	`extra_controller_cents` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL,
	CONSTRAINT "rates_block_minutes_check" CHECK(block_minutes IN (15, 30, 45, 60, 120)),
	CONSTRAINT "rates_cents_check" CHECK(price_cents >= 0 AND extra_controller_cents >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rates_console_type_block_minutes_idx` ON `rates` (`console_type`,`block_minutes`);
