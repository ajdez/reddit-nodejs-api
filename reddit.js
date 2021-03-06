var bcrypt = require('bcrypt-then');
var mysql = require('promise-mysql');
var secureRandom = require('secure-random');
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
          return postReturn[0];
        })
    },
    getAllPost: function(options) {
      var limit = options.numPerPage || 25;
      var offset = (options.page || 0) * limit;
      
      var sortSelect="";
      var sortSort="";
      if(options.sort === "topRanking"){
        sortSelect = ", sum(votes) AS criteria";
        sortSort = "criteria";
      }
      else if (options.sort === "newRanking"){
        sortSelect = "";
        sortSort = "Post_ID"
      }
      else {
        sortSelect = `, (SELECT ((SUM(votes)*10000)/(unix_timestamp() - UNIX_TIMESTAMP(createdAt)))
                          FROM votes
                          WHERE votes.postId = Post_ID
                          GROUP BY votes.postId
                          ORDER BY (SELECT ((SUM(votes)*10000)/(unix_timestamp() - UNIX_TIMESTAMP(createdAt))) FROM votes)) AS criteria`;
                          
        sortSort = "criteria"
      }
      
  

      return conn.query(`
            SELECT posts.id AS Post_ID, title, url, posts.userId, posts.createdAt AS postCreate, posts.updatedAt AS postUpdate, 
              users.id AS User_ID, users.username AS Username, users.createdAt AS userCreate, users.updatedAt AS userUpdate,
              subreddits.id AS subId, subreddits.name AS subName, subreddits.description AS subDesc ${sortSelect}
            FROM users 
            LEFT JOIN posts ON posts.userId = users.id
            LEFT JOIN subreddits ON subreddits.id = posts.subredditId
            LEFT JOIN votes ON votes.postId = posts.id
            GROUP BY Post_ID
            ORDER BY ${sortSort} DESC
            LIMIT ? OFFSET ?`, [limit, offset]) // sortingMethod is how we decide to sort the data
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
        })
    },
    createSubreddit: function(sub) { //sub object will contain 'name' and optional 'description'
      return conn.query(`INSERT INTO subreddits (name, description, createAt) VALUES (?, ?, ?)`, [sub.name, sub.description, new Date()])
        .then(function(subredditInfo) {
          return conn.query(`SELECT subreddits.id, subreddits.name, subreddits.description, subreddits.createAt, subreddits.updatedAt FROM subreddits WHERE subreddits.id = ?`, [subredditInfo.insertId]);
        })
        .then(function(subredditReturn) {
          return subredditReturn[0];
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
    },
    createOrUpdateVote: function(voteInfo) {
      console.log(voteInfo)
      return conn.query(`SELECT votes FROM votes WHERE userId = ? AND postId = ?`, [voteInfo.userId, +voteInfo.postId])
      .then(function(voteDB){
        console.log(voteDB)
        var oldVote = !voteDB[0] ? null : voteDB[0].votes;
        var newVote = +voteInfo.votes;
        
        console.log(oldVote, newVote)
        newVote = oldVote===newVote ? 0 : newVote;
        
        return conn.query(`
          INSERT INTO votes SET postId = ? , userId = ?, createdAt = ?, votes = ? ON DUPLICATE KEY UPDATE votes = ?`, [voteInfo.postId, voteInfo.userId, new Date(), newVote, newVote]
        )
      })
      .then(function(result) {
        console.log(result)
      })
      .catch(console.log)
    },
    checkLogin: function(user, pass) {
      var username;
      return conn.query(`SELECT username, password FROM users WHERE username = ?`, [user])
        .then(function(result) {
          if (result.length === 0) {
            throw (new Error("username or password is incorrect"));
          }
          else{
            username = result[0];
            var hash = username.password;
            return bcrypt.compare(pass, hash)
          }
        })
        .then(function(result) {
          if (result === true) {
            return username;                                                                              //username => id
          }
          else {
            throw (new Error("username or password is incorrect"));
          }
        })
    },
    createSessionToken: function() {
      return secureRandom.randomArray(100).map(code => code.toString(36)).join("");
    },
    createSession: function(userName) {
      var token = this.createSessionToken();
      return conn.query(`SELECT id FROM users WHERE username = ?`, [userName])
      .then(function(userId){
        return conn.query(`INSERT INTO sessions SET sessionToken = ?, userId = ?`,[token, userId[0].id])
      })
      .then(function(){
        return token;
      })
    },
    getUserFromSession: function(cookie){
      return conn.query(`SELECT userId FROM sessions WHERE sessionToken = ?`, [cookie]);
    },
    createComment: function(comment){
      return conn.query(`INSERT INTO (text, userId, postId, createdAt, parentId) VALUES (?, ?, ?, ?, ?`,[comment.text, comment.userId, comment.postId, new Date(), comment.postId])
      .then(function(result){
        conn.query(`SELECT id, text, userId, postId, createdAt, parentId FROM comments WHERE id = ?`, [result.insertId])
      })
      .then(function(queryObject){
        return queryObject[0];
      })
    },
    getCommentsForPost: function(postId){
      
    }
  }
}







