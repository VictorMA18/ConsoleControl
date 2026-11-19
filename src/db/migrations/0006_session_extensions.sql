CREATE TABLE `session_extensions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`minutes` integer NOT NULL,
	`previous_total_cents` integer NOT NULL,
	`new_total_cents` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "session_extensions_minutes_check" CHECK(minutes IN (15, 30))
);
--> statement-breakpoint
CREATE INDEX `session_extensions_session_id_idx` ON `session_extensions` (`session_id`);--> statement-breakpoint
CREATE INDEX `session_extensions_sync_status_idx` ON `session_extensions` (`sync_status`);