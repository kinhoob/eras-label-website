ALTER TABLE `admin_users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shippingOrderId` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `labelPdfUrl` text;