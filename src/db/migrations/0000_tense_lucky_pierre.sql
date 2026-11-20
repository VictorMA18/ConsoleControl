CREATE TABLE `consoles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`console_type` text NOT NULL,
	`status` text DEFAULT 'disponible' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consoles_name_unique` ON `consoles` (`name`);--> statement-breakpoint
CREATE TABLE `controllers` (
	`id` text PRIMARY KEY NOT NULL,
	`console_id` text NOT NULL,
	`label` text NOT NULL,
	`status` text DEFAULT 'operativo' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL,
	FOREIGN KEY (`console_id`) REFERENCES `consoles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `controllers_console_id_idx` ON `controllers` (`console_id`);--> statement-breakpoint
CREATE TABLE `rates` (
	`id` text PRIMARY KEY NOT NULL,
	`console_type` text NOT NULL,
	`mode` text NOT NULL,
	`price_cents` integer NOT NULL,
	`extra_controller_cents` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rates_console_type_mode_idx` ON `rates` (`console_type`,`mode`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`console_id` text NOT NULL,
	`rate_id` text NOT NULL,
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
	FOREIGN KEY (`rate_id`) REFERENCES `rates`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "sessions_controller_count_check" CHECK(controller_count BETWEEN 1 AND 6),
	CONSTRAINT "sessions_duration_ms_check" CHECK((mode = 'libre' AND duration_ms IS NULL) OR (mode <> 'libre' AND duration_ms > 0))
);
--> statement-breakpoint
CREATE INDEX `sessions_console_id_status_idx` ON `sessions` (`console_id`,`status`);--> statement-breakpoint
CREATE INDEX `sessions_sync_status_idx` ON `sessions` (`sync_status`);