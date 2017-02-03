// Dependencies
// load the mysql library
var mysql = require('promise-mysql');
// create a connection to our Cloud9 server
var connection = mysql.createPool({
  host     : 'localhost',
  user     : process.env.C9_USER, // CHANGE THIS :)
  password : '',
  database: 'reddit'
});
// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


// Specify the usage of the Pug template engine
app.set('view engine', 'pug');
// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
// app.use(bodyParser.urlencoded({extended: false}));
// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
app.use(cookieParser());
// This middleware will console.log every request to your web server! Read the docs for more info!
app.use(morgan('dev'));

//This middleware will check to see if user has a SESSION opened
app.use(checkLoginToken);

// app.use('/secret', function(request, response, next) {
//   if (request.loggedInUser) {
//     next();
//   }
//   else {
//     response.send('you are not authorized');
//   }
// })


/*
IMPORTANT!!!!!!!!!!!!!!!!!
Before defining our web resources, we will need access to our RedditAPI functions.
You will need to write (or copy) the code to create a connection to your MySQL database here, and import the RedditAPI.
Then, you'll be able to use the API inside your app.get/app.post functions as appropriate.
*/
// Resources
app.get('/', function(req, res) {

  redditAPI.getAllPost({})
  .then(function(postList){
      res.render('post-list', {posts: postList});
  })
  
  /*
  Response.render will call the Pug module to render your final HTML.
  Check the file views/post-list.pug as well as the README.md to find out more!
  */
 
});

app.post("/", function(request, response){
  redditAPI.getAllPost({sort: request.body.sortButton})
  .then(function(postList){
      response.render('post-list', {posts: postList});
  })
})




app.get('/login', function(request, response) {
  // code to display login form
  response.render("login");
  
  
});
app.post('/login', function(request, response) {
  // code to login a user
  // hint: you'll have to use response.cookie here
  redditAPI.checkLogin(request.body.username, request.body.password)
  .then(function(user){
    return redditAPI.createSession(user.username)
  })

  .then(function(tokenSession){
    response.cookie('SESSION', tokenSession);
    response.redirect('/createPost');
  })
  .catch(function(err){
    if (err){
      response.status(400).send(err.message);
    }
    else{
      response.status(500).send('An error as occured');
    }
  })
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/createPost",function(request, response){
  response.render("create-post")
})

app.post("/createPost", function(request, response){
  if(request.loggedInUser){
    redditAPI.createPost({
    userId: request.loggedInUser[0].userId,
    title: request.body.title,
    url: request.body.url
  })
  response.redirect("/");
  }
  else{
    response.redirect("/signup");
  }
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/signup', function(request, response) {
  // code to display signup form
    response.render("signup");
});


app.post('/signup', function(request, response) {
  // code to signup a user
  // ihnt: you'll have to use bcrypt to hash the user's password
    redditAPI.createUser({username: request.body.username,
                        password: request.body.password})
                        .then(function(x){
                            response.redirect("/");
                        })
});




app.post('/vote', function(request, response) {
  // code to add an up or down vote for a content+user combination
  redditAPI.createOrUpdateVote({postId: request.body.postId,
                                votes: request.body.vote,
                                userId: request.loggedInUser[0].userId
  })
  .then(response.send("You made a vote"))
  
  
});
// Listen
var port = process.env.PORT || 3000;
app.listen(port, function() {
  // This part will only work with Cloud9, and is meant to help you find the URL of your web server :)
  if (process.env.C9_HOSTNAME) {
    console.log('Web server is listening on https://' + process.env.C9_HOSTNAME);
  }
  else {
    console.log('Web server is listening on http://localhost:' + port);
  }
});




function checkLoginToken (request, response, next){
  if(request.cookies.SESSION){
    return redditAPI.getUserFromSession(request.cookies.SESSION)
    .then(function(userId){
      if(userId){
        request.loggedInUser = userId; 
      }
      next();
    });
  }
  else{
    next();
  }
}