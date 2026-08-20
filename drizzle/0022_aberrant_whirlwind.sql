CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(120) NOT NULL,
	`path` varchar(255) NOT NULL,
	`eventType` varchar(40) NOT NULL DEFAULT 'page_view',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
