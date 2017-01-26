//load the mysql library
var mysql = require('promise-mysql');

//create conection to our clout 9 server

var connection = mysql.createPool({ //should this be createPool
    host:'localhost',
    user: 'ajdez',
    password: '',
    database: 'reddit',
    connectionLimit: 10
})


var reddit = require('./reddit');
var redditAPI = reddit(connection);


/*
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
  */
  
redditAPI.getAllPost({})

// It's request time!

