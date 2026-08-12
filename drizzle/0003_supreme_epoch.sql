CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`targetRole` enum('all','admin','customer') NOT NULL DEFAULT 'customer',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('new_order','payment_confirmed','order_shipped','general') NOT NULL DEFAULT 'general',
	`orderId` int,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
