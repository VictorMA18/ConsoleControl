CREATE TABLE `shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`opened_at` integer NOT NULL,
	`closed_at` integer,
	`status` text DEFAULT 'abierto' NOT NULL,
	`cash_cents` integer,
	`digital_cents` integer,
	`credit_cents` integer,
	`counted_cash_cents` integer,
	`difference_cents` integer,
	`balance` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `shifts_status_idx` ON `shifts` (`status`);--> statement-breakpoint
ALTER TABLE `payments` ADD `shift_id` text REFERENCES shifts(id);--> statement-breakpoint
ALTER TABLE `payments` ADD `modified_at` integer;--> statement-breakpoint
CREATE INDEX `payments_shift_id_idx` ON `payments` (`shift_id`);