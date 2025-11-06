ALTER TABLE `users` MODIFY COLUMN `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhoto` text;