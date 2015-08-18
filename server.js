var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var partials = require('express-partials');

//require db connection to creating tables
var db = require('./models/database');

//our models
var Users = require('./models/user').Users;
var User = require('./models/user').User;

var app = express();

app.use('/', express.static('static'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    cookie: {},
    secret: 'final_assemnent_key',
    saveUninitialized: true,
    resave: true
}));


function checkAuth(req, res, next){
    //just simple check if user is already registered - should have filled its user_id in the session object
    if(req.session.userId != null){
        next();
    } else {
        res.redirect(302, '/login')
    }
}

app.get('/', checkAuth, function(req, res){
    res.render('index', { 'userName': req.session.userName });
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/logout', function(req, res){
    //just clear out the session data and then redirect to login page...
    req.session.userId = null;
    req.session.userName = null;
    res.redirect(302, '/login');
});

app.get('/signup', function(req, res){
    res.render('signup');
});

app.post('/login', function(req, res) {
    if(req.body != null && req.body.username != null && req.body.password != null){
        //we will try to find out the user
        new User({ username: req.body.username}).fetch().then(function(user) {
            if(user != null){
                req.session.userId = user.get('id');
                req.session.userName = req.body.username;
                res.redirect(302, '/');
            }
            else{
                res.redirect(302, '/login#nosuchuser');
            }
        });
    } else {
        res.redirect(302, '/login');
    }
});

app.post('/signup', function(req, res) {
    if(req.body != null && req.body.username != null && req.body.password != null){
        //we will try to findout the user in case that he will exist
        new User({ username: req.body.username}).fetch().then(function(user) {
                //in case that user exist, we will tell that to the client side
                if(user != null){
                    res.redirect(302, '/signup#userexist');
                }
                else{
                    //user does not exist ->create and save it
                    new User({ username: req.body.username, password: req.body.password }).save().then(function (user){
                        req.session.userId = user.get('id');
                        req.session.userName = req.body.username;
                        res.redirect(302, '/');
                    });
                }
            });
    } else {
        res.redirect(302, '/signup');
    }
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server started - http://%s:%s', host, port);
});

