CREATE TABLE `site_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`message` text,
	`originTag` varchar(50) NOT NULL DEFAULT 'contato',
	`couponCode` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_messages_id` PRIMARY KEY(`id`)
);
