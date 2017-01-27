var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var HASH_ROUNDS = 10;


module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user) {
      return bcrypt.hash(user.password, HASH_ROUNDS)
        .then(function(hashedPassword) {
          return conn.query(
            'INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()]
          )
        })
        .catch(function(err) {
          if (err.code === "ER_DUP_ENTRY") {
            throw (new Error('A user with this username already exist'))
          }
          else {
            throw (err);
          }
        })
        .then(function(result) {
          return conn.query(
            'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId]
          )
        })
        .then(function(result) {
          return result[0];
        })
        .catch(function(err) {
          return err;
        })
    },
    createPost: function(post) {
      return conn.query(
          'INSERT INTO posts (userId, title, url, createdAt, subredditId) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, new Date(), post.subredditId]
        )
        .then(function(postInfo) {
          return conn.query(
            'SELECT id, title, url, userId, createdAt, updatedAt, subredditId FROM posts WHERE id = ?', [postInfo.insertId]
          )
        })
        .then(function(postReturn) {
          conn.end();
          return postReturn[0];
        })
        .catch(function(err) {
          conn.end();
          return err;
        })
    },
    getAllPost: function(options) {
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;
      return conn.query(`
            SELECT posts.id AS Post_ID, title, url, userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate,
              subreddits.id AS subId, subreddits.name AS subName, subreddits.description AS subDesc
            FROM users 
            JOIN posts ON posts.userId = users.id
            JOIN subreddits ON subreddits.id = posts.subredditId
            ORDER BY postCreate DESC
            LIMIT ? OFFSET ?`, [limit, offset])
        .then(function(result) {
          var array = [];

          result.forEach(function(row, i) {
            var post = array.find(function(post) {
              return row.Post_ID === post.Post_ID;
            })
            if (!post) {
              post = {
                id: row.Post_ID,
                title: row.title,
                url: row.url,
                createdAt: row.postCreate,
                updatedAt: row.postUpdate,
                userId: row.userId,
                user: [],
                subredditInfo: []
              }
              array.push(post);
            }
            post.user.push({
              id: row.User_ID,
              username: row.Username,
              createdAt: row.userCreate,
              updatedAt: row.userUpdate
            });
            post.subredditInfo.push({
              id: row.subId,
              name: row.subName,
              description: row.subDesc
            });
          })
          return array;
        })
        .then(function(result) {
          conn.end()
          return (JSON.stringify(result, null, 4));
        })
        .catch(function(err) {
          conn.end();
          return ("THIS IS THE ERROR : ", err);
        })      
    },
    getAllPostsForUser: function(userId, options) {

      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      return conn.query(`
            SELECT posts.id AS Post_ID, title, url, userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate
            FROM posts 
            JOIN users ON posts.userId = users.id
            WHERE posts.userId = ?
            ORDER BY postCreate DESC
            LIMIT ? OFFSET ?`, [userId, limit, offset])
        .then(function(result) {

          var array = [];

          result.forEach(function(row, i) {
            var post = array.find(function(post) {
              return row.Post_ID === post.Post_ID;
            })
            if (!post) {
              post = {
                id: row.Post_ID,
                title: row.title,
                url: row.url,
                createdAt: row.postCreate,
                updatedAt: row.postUpdate,
                userId: row.userId,
                user: []
              }
              array.push(post);
            }
            post.user.push({
              id: row.User_ID,
              username: row.Username,
              createdAt: row.userCreate,
              updatedAt: row.userUpdate
            })
          })
          return array;
        })
        .then(function(result) {
          console.log(JSON.stringify(result, null, 4));
          conn.end()
        })
        .catch(function(err) {
          conn.end();
          return err;
        })
    },
    getSinglePost: function(postId, options) {

      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      return conn.query(`
        SELECT posts.id AS Post_ID, title, url, users.username
        FROM posts
        JOIN users ON users.id = posts.userId
        WHERE posts.id = ?
        LIMIT ? OFFSET ?`, [postId, limit, offset])
        .then(function(result) {
          var hello = result[0];

          console.log(JSON.stringify(hello, null, 4));
          conn.end();
        })
    },
    createSubreddit: function(sub) { //sub object will contain 'name' and optional 'description'
      return conn.query(`INSERT INTO subreddits (name, description, createAt) VALUES (?, ?, ?)`, [sub.name, sub.description, new Date()])
        .then(function(subredditInfo) {
          return conn.query(`SELECT subreddits.id, subreddits.name, subreddits.description, subreddits.createAt, subreddits.updatedAt FROM subreddits WHERE subreddits.id = ?`, [subredditInfo.insertId]);
        })
        .then(function(subredditReturn) {
          conn.end();
          return subredditReturn[0];
        })
        .catch(function(err) {
          conn.end();
          return ("You got an ERROR while trying to add a subreddit :: ", err);
        })
    },
    getAllSubreddits: function(options) { //why do all dates become the date of today?
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;

      return conn.query(`
        SELECT id, name, description, createAt, updatedAt
          FROM subreddits
          ORDER BY createAt DESC
          LIMIT ? OFFSET ?`, [limit, offset])
        .then(function(result) {
          conn.end();
          return result;
        })
        .catch(err => ("THIS IS THE ERROR : ", err));
    }
  }
}




