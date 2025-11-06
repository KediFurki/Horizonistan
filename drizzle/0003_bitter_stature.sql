CREATE TABLE `userScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`correctResults` int NOT NULL DEFAULT 0,
	`correctScores` int NOT NULL DEFAULT 0,
	`totalPredictions` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userScores_id` PRIMARY KEY(`id`),
	CONSTRAINT `userScores_userId_unique` UNIQUE(`userId`)
);
