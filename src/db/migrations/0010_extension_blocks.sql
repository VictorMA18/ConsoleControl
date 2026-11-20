PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_session_extensions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`minutes` integer NOT NULL,
	`previous_total_cents` integer NOT NULL,
	`new_total_cents` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "session_extensions_minutes_check" CHECK(minutes IN (15, 30, 60, 120))
);
--> statement-breakpoint
INSERT INTO `__new_session_extensions`("id", "session_id", "minutes", "previous_total_cents", "new_total_cents", "created_at", "updated_at", "sync_status") SELECT "id", "session_id", "minutes", "previous_total_cents", "new_total_cents", "created_at", "updated_at", "sync_status" FROM `session_extensions`;--> statement-breakpoint
DROP TABLE `session_extensions`;--> statement-breakpoint
ALTER TABLE `__new_session_extensions` RENAME TO `session_extensions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `session_extensions_session_id_idx` ON `session_extensions` (`session_id`);--> statement-breakpoint
CREATE INDEX `session_extensions_sync_status_idx` ON `session_extensions` (`sync_status`);