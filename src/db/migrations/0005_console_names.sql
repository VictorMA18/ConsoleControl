-- Las consolas se identifican como "MAQ #n" para buscarlas por número; el tipo se ve en la pastilla
-- de plataforma. Solo renombra las consolas iniciales (seedData.ts) por su id fijo.
UPDATE `consoles` SET `name` = 'MAQ #1' WHERE `id` = '2c26a7b0-b208-44c7-b905-8de14c44db65';--> statement-breakpoint
UPDATE `consoles` SET `name` = 'MAQ #2' WHERE `id` = '9be9a615-3d18-4f92-a2fe-bfef68268278';--> statement-breakpoint
UPDATE `consoles` SET `name` = 'MAQ #3' WHERE `id` = '551f976b-9f52-4e32-9db4-a2c938431f4f';--> statement-breakpoint
UPDATE `consoles` SET `name` = 'MAQ #4' WHERE `id` = '95bce93b-3e0a-401d-b7a6-65ae769ece61';--> statement-breakpoint
UPDATE `consoles` SET `name` = 'MAQ #5' WHERE `id` = 'fb64a232-3044-4929-99c9-8a0c7203cdac';
