var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var partials = require('express-partials');

var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

//require db connection to creating tables
var db = require('./models/database');

//our models
var Users = require('./models/user').Users;
var User = require('./models/user').User;

var config = require('./config');

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

//github think

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

console.log("Using these GitHub keys: " + config.GITHUB_KEY + ", " + config.GITHUB_SECRET);

passport.use(new GitHubStrategy({
        clientID: config.GITHUB_KEY,
        clientSecret: config.GITHUB_SECRET,
        callbackURL: "http://localhost:3000/githubcallback"
    },
    function(accessToken, refreshToken, profile, done) {
        new User({ githubid: profile['id']}).fetch().then(function(user) {
            if (!user) {
                new User({ username: profile['username'], password: "", githubid: profile['id'] }).save().then(function(newuser) {
                    return done(null, profile);
                });
            } else {
                return done(null, profile);
            }
        });
    }
));

app.get('/github',
    passport.authenticate('github'));

app.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect(302, '/');
    });

function checkAuth(req, res, next){
    //just simple check if user is already registered - should have filled its user_id in the session object
    if (req.isAuthenticated()) {
        return next();
    }
    if(req.session.userId != null){
        return next();
    } else {
        res.redirect(302, '/login')
    }
}

app.get('/', checkAuth, function(req, res){
    var userName = req.session.userName;
    if (!userName) {
        if (req.session['passport'] && req.session['passport']['user'] && req.session['passport']['user']['username']) {
            userName = req.session['passport']['user']['username']
        }
    }
    res.render('index', {'userName': userName});
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

var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server started - http://%s:%s', host, port);
});

