-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(60) NOT NULL, -- why 60??? ask me :)
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`), -- why did we add this here? ask me :)
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
);


INSERT INTO users VALUES(null, 'jojoRaver', 'password', "2017-01-01", "2017-01-02");
INSERT INTO users VALUES(null, 'ladyfingers', 'password', "2016-01-15", "2017-03-05");
INSERT INTO users VALUES(null, 'jeremySpoke', 'password', "2015-11-16", "2016-12-28");
INSERT INTO users VALUES(null, 'boyonceLover123', 'password', "2017-01-01", "2017-12-12");
INSERT INTO users VALUES(null, 'rinkSideHips', 'password', "2016-10-06", "2017-01-02");

INSERT INTO posts VALUES(null, "the rabbit ate my food", "www.google.com", 2, "2017-01-01", "2017-12-12");
INSERT INTO posts VALUES(null, "do dogs hate mailmen?", "www.yahoo.com", 3, "2017-01-03", "2017-12-12");
INSERT INTO posts VALUES(null, "do all dogs go to heaven? My dog is kind of a dick", "www.bing.com", 2, "2017-01-04", "2017-03-12");
INSERT INTO posts VALUES(null, "my mom says I need to clean by room, what options do I have", "www.google.com", 1, "2017-01-01", "2017-08-12");
INSERT INTO posts VALUES(null, "what is the best way to sue my neighbor? She is 85 years old but is a real meany", "www.google.com", 4, "2017-01-01", "2017-12-10");





