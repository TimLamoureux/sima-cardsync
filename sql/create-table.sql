CREATE TABLE `passholders` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	`masterlist_id`	INTEGER NOT NULL,
	`first_name`	TEXT NOT NULL,
	`last_name`	TEXT NOT NULL,
	`pass_type`	TEXT NOT NULL,
	`emergency_contact`	TEXT,
	`photo`	BLOB,
	`picked_up`	NUMERIC DEFAULT 0,
	`notes`	TEXT,
	`platform`	INTEGER
);