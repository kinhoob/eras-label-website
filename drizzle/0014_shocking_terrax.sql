CREATE TABLE `shipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shipmentNumber` varchar(50) NOT NULL,
	`type` varchar(30) NOT NULL DEFAULT 'Avulso',
	`recipientName` varchar(255) NOT NULL,
	`recipientAddress` text NOT NULL,
	`carrier` varchar(100) NOT NULL DEFAULT 'Jadlog Econômico',
	`trackingCode` varchar(100),
	`shippingCost` decimal(10,2) NOT NULL DEFAULT '0.00',
	`estimatedDays` int NOT NULL DEFAULT 5,
	`status` varchar(50) NOT NULL DEFAULT 'Por enviar',
	`labelPdfUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipments_shipmentNumber_unique` UNIQUE(`shipmentNumber`)
);
