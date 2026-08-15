-- Catalog management additions: SKU, product subcategory and category cover metadata.
-- These columns are nullable to preserve all existing products and categories.
ALTER TABLE `products`
  ADD COLUMN `subcategory` varchar(100) NULL,
  ADD COLUMN `sku` varchar(100) NULL;

ALTER TABLE `categories`
  ADD COLUMN `parentId` int NULL,
  ADD COLUMN `coverImageUrl` text NULL;
