ALTER TABLE `collections` ADD `editorialText` text;--> statement-breakpoint
ALTER TABLE `collections` ADD `ctaLabel` varchar(100);--> statement-breakpoint
ALTER TABLE `collections` ADD `ctaUrl` varchar(255);--> statement-breakpoint
ALTER TABLE `collections` ADD `sortOrder` int DEFAULT 0 NOT NULL;