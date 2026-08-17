ALTER TABLE `products` ADD `slug` varchar(180);--> statement-breakpoint
ALTER TABLE `products` ADD `visibility` varchar(20) DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_slug_unique` UNIQUE(`slug`);