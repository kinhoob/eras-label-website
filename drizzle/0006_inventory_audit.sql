CREATE TABLE IF NOT EXISTS `inventory_audit_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `productId` int NOT NULL,
  `productName` varchar(255) NOT NULL,
  `size` varchar(20) NOT NULL,
  `previousStock` int NOT NULL,
  `newStock` int NOT NULL,
  `adminEmail` varchar(320) NOT NULL,
  `adminName` varchar(255),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
