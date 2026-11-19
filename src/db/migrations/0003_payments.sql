CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`method` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`customer_name` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "payments_amount_cents_check" CHECK(amount_cents > 0)
);
--> statement-breakpoint
CREATE INDEX `payments_session_id_idx` ON `payments` (`session_id`);--> statement-breakpoint
CREATE INDEX `payments_created_at_idx` ON `payments` (`created_at`);