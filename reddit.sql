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

CREATE TABLE subreddits (
  id                    INT     AUTO_INCREMENT      PRIMARY KEY,
  name                  VARCHAR(30)         NOT NULL,
  description           VARCHAR(200),
  createAt              DATE,
  updatedAt             DATE,
  UNIQUE(name)
);


CREATE TABLE votes(
userId        INT           REFERENCES users(id),
postId        INT           REFERENCES posts(id),
votes         TINYINT,  -- find how to use trigger. 
createdAt     DATE,
updatedAt     DATE,
primary key(userId, postId)
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





--ADDED new FK column in posts linking to subreddit page


ALTER TABLE posts 
ADD subredditId   INT ;  

ALTER TABLE posts
ADD FOREIGN KEY (`subredditId`)
REFERENCES subreddits(`id`);





-- Top Ranking
SELECT posts.id, SUM(votes.votes) AS Votes_Score
  FROM posts
  JOIN votes ON votes.postId = posts.id
  GROUP BY posts.id;
  
-- Hotness Ranking

SELECT posts.id AS Post_ID, title, url, posts.userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate,
              subreddits.id AS subId, subreddits.name AS subName, subreddits.description AS subDesc, SUM(votes.votes) AS voteScore
            FROM users 
            LEFT JOIN posts ON posts.userId = users.id
            LEFT JOIN subreddits ON subreddits.id = posts.subredditId
            LEFT JOIN votes ON votes.postId = posts.id
            GROUP BY Post_ID
            ORDER BY (voteScore/(new Date() - postCreate)) DESC;
            
            
SELECT posts.id AS Post_ID, title, url, posts.userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate,
            subreddits.id AS subId, subreddits.name AS subName,
            SUM(votes.votes) AS TotalVotes
            FROM posts 
            LEFT JOIN votes ON votes.postId = posts.id
            LEFT JOIN subreddits ON subreddits.id = posts.subredditId
            GROUP BY Post_ID
            ORDER BY TotalVotes;
            
            
            
CREATE TABLE sessions (
  sessionToken            varchar(255)         PRIMARY KEY,
  userId                  INT(11)                 REFERENCES users(id)
);





-- Top Vote
SELECT postId, sum(votes)
FROM votes
GROUP BY postId;

       --full quuery
SELECT posts.id AS Post_ID, title, url, posts.userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate,
              subreddits.id AS subId, subreddits.name AS subName, subreddits.description AS subDesc,  sum(votes) AS criteria
            FROM users 
            LEFT JOIN posts ON posts.userId = users.id
            LEFT JOIN subreddits ON subreddits.id = posts.subredditId
            LEFT JOIN votes ON votes.postId = posts.id
            GROUP BY Post_ID
            ORDER BY criteria DESC;


--Hotness (score)
SELECT postId, ((SUM(votes)*10000)/(unix_timestamp() - UNIX_TIMESTAMP(createdAt))) AS TIME
FROM votes
GROUP BY postId
ORDER BY (SELECT ((SUM(votes)*10000)/(unix_timestamp() - UNIX_TIMESTAMP(createdAt))) FROM votes);


        --Full Query
SELECT posts.id AS Post_ID, title, url, posts.userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate,
              subreddits.id AS subId, subreddits.name AS subName, subreddits.description AS subDesc,  (SELECT ((SUM(votes)*10000)/(unix_timestamp() - UNIX_TIMESTAMP(createdAt)))
                                                                                                        FROM votes
                                                                                                        WHERE votes.postId = Post_ID
                                                                                                        GROUP BY votes.postId
                                                                                                        ORDER BY (SELECT ((SUM(votes)*10000)/(unix_timestamp() - UNIX_TIMESTAMP(createdAt))) FROM votes)) AS criteria
            FROM users 
            LEFT JOIN posts ON posts.userId = users.id
            LEFT JOIN subreddits ON subreddits.id = posts.subredditId
            LEFT JOIN votes ON votes.postId = posts.id
            GROUP BY Post_ID
            ORDER BY criteria DESC;




--Newest Ranking
SELECT id
FROM posts
ORDER BY createdAt;

          --full query
SELECT posts.id AS Post_ID, title, url, posts.userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate,
              subreddits.id AS subId, subreddits.name AS subName, subreddits.description AS subDesc
            FROM users 
            LEFT JOIN posts ON posts.userId = users.id
            LEFT JOIN subreddits ON subreddits.id = posts.subredditId
            LEFT JOIN votes ON votes.postId = posts.id
            GROUP BY Post_ID
            ORDER BY postCreate DESC;

--Controversial

-- numUpvotes < numDownvotes ? totalVotes * (numUpvotes / numDownvotes) : totalVotes * (numDownvotes / numUpvotes) 
-- we can filter out posts that have few votes (< 100) since they may not be meaningful.


SELECT (SELECT count(postId)
          FROM votes
          WHERE votes = 1
          GROUP BY postId) AS numUpVotes, 
          (SELECT count(postId) 
          FROM votes
          WHERE votes = -1
          GROUP BY postId) AS numDownVotes,
          (SELECT count(postId)
            FROM votes
            GROUP BY postId) AS totalVotes
   FROM votes
   WHERE votes > 99
    
  



SELECT postId, count(postId) AS numUpVotes
FROM votes
WHERE votes = 1
GROUP BY postId
ORDER BY numUpVotes;


SELECT postId, count(postId) AS numDownVotes
FROM votes
WHERE votes = -1
GROUP BY postId
ORDER BY numUpVotes;

SELECT postId, count(postId) AS totalVotes
FROM votes
GROUP BY postId
ORDER BY totalVotes;




SELECT posts.id AS Post_ID, title, url, posts.userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate,
              subreddits.id AS subId, subreddits.name AS subName, subreddits.description AS subDesc,  (SELECT id
                      FROM posts
                      ORDER BY createdAt) AS criteria
            FROM users 
            LEFT JOIN posts ON posts.userId = users.id
            LEFT JOIN subreddits ON subreddits.id = posts.subredditId
            LEFT JOIN votes ON votes.postId = posts.id
            GROUP BY Post_ID
            ORDER BY criteria DESC;
            
            



select count(postId) < sum(postId) ? 5 : 10
from votes
where postId = 8
group by postId;






CREATE TABLE comments (
  id          INT               auto_increment        PRIMARY KEY,
  text        VARCHAR(10000),
  createdAt   DATETIME,
  updatedAt   DATETIME,
  userId      INT               REFERENCES users(id),
  postId      INT               REFERENCES posts(id),
  parentId    INT               
);




INSERT INTO comments VALUES(null, "First comment!", "2017-02-03", null, 7, 1, null);
INSERT INTO comments VALUES(null, "First reply!", "2017-02-03", null, 8, 1, 1);
INSERT INTO comments VALUES(null, "I have a large issue with this content!", "2017-02-03", null, 10, 1, null);
INSERT INTO comments VALUES(null, "First comment!", "2017-02-03", null, 8, 1, null);
INSERT INTO comments VALUES(null, "First comment!", "2017-02-03", null, 10, 1, 2);
INSERT INTO comments VALUES(null, "First comment!", "2017-02-03", null, 11, 1, 2);


SELECT comments.text 
FROM comments 
LEFT JOIN posts ON (posts.id  = comments.postId 
LEFT JOIN comments ON comments.postId = posts.id;

