CREATE TABLE `product_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`categoryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`)
);
