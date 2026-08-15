CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(320) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `roleTitle` varchar(100) NOT NULL DEFAULT 'Assistente',
  `permissions` text NOT NULL DEFAULT 'products,inventory,categories,stats,emails,settings',
  `isActive` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
