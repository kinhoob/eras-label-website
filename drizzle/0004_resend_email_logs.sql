CREATE TABLE IF NOT EXISTS `resend_email_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient` varchar(320) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `templateType` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `providerResponse` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* This migration is intentionally idempotent because the table may already exist in deployed databases. */

