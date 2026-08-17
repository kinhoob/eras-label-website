CREATE TABLE `cms_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(500),
	`content` text NOT NULL,
	`bannerUrl` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cms_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `custom_menus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location` varchar(50) NOT NULL DEFAULT 'header',
	`label` varchar(100) NOT NULL,
	`url` varchar(255) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isVisible` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_menus_id` PRIMARY KEY(`id`)
);
