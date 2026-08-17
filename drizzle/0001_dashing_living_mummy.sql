CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`description` text,
	`icon` varchar(80),
	`sortOrder` int NOT NULL DEFAULT 0,
	`categoryStatus` enum('active','inactive') NOT NULL DEFAULT 'active',
	`seoTitle` varchar(180),
	`seoDescription` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`slug` varchar(120) NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`toolKind` enum('calculator','converter','unit') NOT NULL,
	`inputs` json,
	`formula` text,
	`faq` json,
	`relatedToolIds` json,
	`seoTitle` varchar(180),
	`seoDescription` varchar(320),
	`toolStatus` enum('active','inactive','draft') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`logicKey` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tools_id` PRIMARY KEY(`id`),
	CONSTRAINT `tools_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `categories_parent_sort_idx` ON `categories` (`parentId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `tools_category_sort_idx` ON `tools` (`categoryId`,`sortOrder`);