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
  


/* TESTING SECTION TO MAKE SURE QUERY WORKS*/

        /////// TEST ONE //////

// redditAPI.getAllPost({})
// .then(x => console.log(x));

redditAPI.getAllPost({})
.then(function(result){
    console.log(result);
})


        ////TEST TWO///

//redditAPI.getAllPostsForUser(2, {});


        ///Test Three///
//redditAPI.getSinglePost(2, {});

        ///TEST FOUR////  Make sure you change values or you will get error

// redditAPI.createSubreddit({name: "cupcakes", description: " all about food"})
// .then(function(x){
//     console.log(x);
// });


        ///TEST FIVE //////
// redditAPI.getAllSubreddits({})
// .then(x => console.log(x));


        ///TEST SIX/////

// redditAPI.createPost({
//     userId: 1,
//     title: "Why all the fuzz",
//     url: "yahoo.com",
//     subredditId: 5
// })
// .then(x => console.log(x));