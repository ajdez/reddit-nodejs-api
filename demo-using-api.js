// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'ziad_saab', // CHANGE THIS :)
  password: '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);

// It's request time!
return redditAPI.createUser({
    username: 'hello23',
    password: 'xxx'
  })
  .then(function(user) {
    return redditAPI.createPost({
      title: 'hi reddit!',
      url: 'https://www.reddit.com',
      userId: user.id
    })
  })
  .then(function(post) {
    console.log(post);
  })
