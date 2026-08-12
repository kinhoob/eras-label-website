CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`year` varchar(10) NOT NULL,
	`description` text,
	`imageUrl` text,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `site_appearance` DROP INDEX `site_appearance_key_unique`;--> statement-breakpoint
ALTER TABLE `abandoned_carts` ADD `customerEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `abandoned_carts` ADD `customerName` varchar(255);--> statement-breakpoint
ALTER TABLE `abandoned_carts` ADD `total` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `site_appearance` ADD `sectionKey` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `site_appearance` ADD `content` json NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `site_appearance` ADD CONSTRAINT `site_appearance_sectionKey_unique` UNIQUE(`sectionKey`);--> statement-breakpoint
ALTER TABLE `abandoned_carts` DROP COLUMN `contact`;--> statement-breakpoint
ALTER TABLE `abandoned_carts` DROP COLUMN `step`;--> statement-breakpoint
ALTER TABLE `site_appearance` DROP COLUMN `key`;--> statement-breakpoint
ALTER TABLE `site_appearance` DROP COLUMN `value`;