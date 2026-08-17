ALTER TABLE `tools` ADD `isPopular` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tools` ADD `searchKeywords` json;
--> statement-breakpoint
UPDATE `tools` SET `isPopular` = true WHERE `slug` IN ('monthly-rent', 'loan-interest', 'pyeong', 'vat-calculator', 'pdf-convert');
