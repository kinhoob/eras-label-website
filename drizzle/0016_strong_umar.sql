ALTER TABLE `coupons` ADD `promoType` varchar(30) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD `promoRules` json;