ALTER TABLE `orders` ADD `fulfillmentStatus` varchar(30) DEFAULT 'pending_packaging' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `archivedAt` timestamp;