CREATE TABLE `maintenances` (
	`id` text PRIMARY KEY NOT NULL,
	`console_id` text NOT NULL,
	`kind` text NOT NULL,
	`usage_minutes_at` integer NOT NULL,
	`performed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL,
	FOREIGN KEY (`console_id`) REFERENCES `consoles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `maintenances_console_id_kind_idx` ON `maintenances` (`console_id`,`kind`);--> statement-breakpoint
CREATE INDEX `maintenances_sync_status_idx` ON `maintenances` (`sync_status`);