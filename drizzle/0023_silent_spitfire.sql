ALTER TABLE `orders` ADD `paymentId` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `pixExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `pixQrCode` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `pixQrCodeBase64` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `pixTicketUrl` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `pixGeneration` int DEFAULT 0 NOT NULL;