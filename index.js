var express = require('express');
var app = express();
var body_parser = require("body-parser");
var pug = require("pug");

var mysql = require('promise-mysql');

app.use(express.static('static_files'));

//create conection to our clout 9 server

var connection = mysql.createPool({ //should this be createPool
    host: 'localhost',
    user: 'ajdez',
    password: '',
    database: 'reddit',
    connectionLimit: 10
})


var reddit = require('./reddit');
var redditAPI = reddit(connection);






// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

//exercise 1 : GETTING STARTED
app.get('/hello', function(request, response) {
    response.send(`<h1> Hello WORLD !! </h1>`)
});


//exercise 2

app.get('/firstname', function(request, response) {
    console.log(request.query);
    var name = request.query.name;
    response.send("<h1> Hello " + name + "</h1>");
});


//exercise 2B

app.get('/hello/:firstname/:lastname', function(request, response) {
    var firstname = request.params.firstname;
    var lastname = request.params.lastname;

    response.send(`<h1> Hello ${firstname} ${lastname}</h1>`);
})


//exercise 3

app.get('/operation/:option', function(request, response) {
    var num1 = +request.query.numOne;
    var num2 = +request.query.numTwo;

    var obj = {
        operation: request.params.option,
        firstOperand: num1,
        secondOperand: num2,
    }


    if (request.params.option === "add") {
        obj.solution = (num1 + num2);
        response.send(JSON.stringify(obj));
    }
    else if (request.params.option === "sub") {
        obj.solution = (num1 - num2);
        response.send(JSON.stringify(obj));
    }
    else if (request.params.option === "mult") {
        obj.solution = (num1 * num2);
        response.send(JSON.stringify(obj));
    }
    else if (request.params.option === "div") {
        obj.solution = (num1 / num2);
        response.send(JSON.stringify(obj));
    }
    else {
        response.status(404).send("Webpage was not found! Try adding a different operation");
    }
})


//Exercise 4 
//original
// app.get('/posts', function(request, response) {
//     var posts = redditAPI.getAllPost({})

//     return posts.then(function(x) {
//             var str = `<div id = "contents">
//                         <h1> List of contents </h1>
//                             <ul class="contents-list">`
//             x.forEach(function(result) {
//                 str = str + `
//                     <li class="content-item">
//                         <h2 class="content-item__title">
//                         <a href= ${result.url}>${result.title}</a>
//                         </h2>
//                         <p> Created by ${result.user[0].username} </p>
//                     </li>`;
//             })
//             return str += `
//                 </ul>
//             </div>`
//         })
//         .then(function(x){
//             response.send(x);
//         });
// })


//exercise 7 of question 4


app.get("/posts", function(request, response) {
    redditAPI.getAllPost({})
        .then(function(postsList) {
            response.render('post-list', {
                posts: postsList
            });
        })
        .catch(function(err) {
            console.log(err)
        })
});


//exercise 5
//original
// app.get('/newContent', function(request, response){
//     var form = `<form action="/createContent" method="POST"> <!-- what is this method="POST" thing? you should know, or ask me :) -->
//         <div>
//             <input type="text" name="url" placeholder="Enter a URL to content">
//         </div>
//         <div>
//             <input type="text" name="title" placeholder="Enter the title of your content">
//         </div>
//         <button type="submit">Create!</button>
//         </form>`;
//     response.send(form);
// });

//exercise 7
app.set('view engine', 'pug');

app.get('/newContent', function(request, response) {
    response.render('create-content');
});









//exercise 6
app.use(body_parser.json());
app.use(body_parser.urlencoded({
    extended: true
}))

app.post('/createContent', function(request, response) {
    redditAPI.createPost({
            id: 1,
            name: "John Smith",
            url: request.body.url,
            title: request.body.title
        })
        //response.send("OK");
    response.redirect("/newContent")
})


//Exercise 7





/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) ///*/

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
