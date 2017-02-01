// Dependencies
// load the mysql library
var mysql = require('promise-mysql');
// create a connection to our Cloud9 server
var connection = mysql.createPool({
  host     : 'localhost',
  user     : 'randyk', // CHANGE THIS :)
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
// Specify the usage of the Pug template engine
app.set('view engine', 'pug');
// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
app.use(bodyParser.urlencoded({extended: false}));
// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
app.use(cookieParser());
// This middleware will console.log every request to your web server! Read the docs for more info!
app.use(morgan('dev'));
/*
IMPORTANT!!!!!!!!!!!!!!!!!
Before defining our web resources, we will need access to our RedditAPI functions.
You will need to write (or copy) the code to create a connection to your MySQL database here, and import the RedditAPI.
Then, you'll be able to use the API inside your app.get/app.post functions as appropriate.
*/
// Resources
app.get('/', function(req, res) {
  /*
  Your job here will be to use the RedditAPI.getAllPosts function to grab the real list of posts.
  For now, we are simulating this with a fake array of posts!
  */
  var posts = [
    {
      id: 123,
      title: 'Check out this cool site!',
      url: 'https://www.decodemtl.com/',
      user: [{
        id: 42,
        username: 'cool_dude'
      }]
    },
    {
      id: 400,
      title: 'This is SPARTA!!!',
      url: 'http://www.SPARTA.com/',
      user:[ {
        id: 222,
        username: 'Merilize'
      }]
    }
  ];
    redditAPI.getAllPost(posts)
    .then(function(postList){
        res.render('post-list', {posts: posts});
    })
  /*
  Response.render will call the Pug module to render your final HTML.
  Check the file views/post-list.pug as well as the README.md to find out more!
  */
 
});
app.get('/login', function(request, response) {
  // code to display login form
  
  
});
app.post('/login', function(request, response) {
  // code to login a user
  // hint: you'll have to use response.cookie here
});



app.get('/signup', function(request, response) {
  // code to display signup form
    response.render("signup");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))


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