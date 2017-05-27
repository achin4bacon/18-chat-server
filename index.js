//      _____ _           _     _____                          
//     /  __ \ |         | |   /  ___|                         
//     | /  \/ |__   __ _| |_  \ `--.  ___ _ ____   _____ _ __ 
//     | |   | '_ \ / _` | __|  `--. \/ _ \ '__\ \ / / _ \ '__|
//     | \__/\ | | | (_| | |_  /\__/ /  __/ |   \ V /  __/ |   
//      \____/_| |_|\__,_|\__| \____/ \___|_|    \_/ \___|_|   

     /////////////////////////////////////////////
    /////////////////////////////////////////////
   //////////Require Modules////////////////////
  /////////////////////////////////////////////
 /////////////////////////////////////////////
var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongodb = require('mongodb');
var ObjectID = require("mongodb").ObjectId;
var db;
var app = express();

/////connect MONGO
mongodb.MongoClient.connect('mongodb://localhost', function(err, database) {
	if (err) {
		console.log(err);
		return;
	}
	console.log("Hooray! You done got a database! ERMERGERD!");
	db = database;
	startListening();
});

/////use BODYPARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//require EXPRESS SESSION
app.use(expressSession({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

     /////////////////////////////////////////////
    /////////////////////////////////////////////
   ////////////////AUTH ENDPOINT////////////////
  /////////////////////////////////////////////
 /////////////////////////////////////////////
app.get('/api/authentication', function(req, res){
	if(!req.session.user){
		res.send("error");
	}
});

     /////////////////////////////////////////////
    /////////////////////////////////////////////
   /////////////REGISTER NEW USER///////////////
  /////////////////////////////////////////////
 /////////////////////////////////////////////
app.post('/api/register', function(req, res){
	 // Check first to see if a user with that username already exists
	db.collection('users').findOne({
		username: req.body.username
	}, function(err, data){
		if(err){
			console.log(err);
			return;
		}
		if(data !== null){
			res.send('This username already exists! MEOW');
			return;
		}
		// Otherwise, add a new user to the db
		db.collection('users').insertOne({
			username: req.body.username,
			password: req.body.password //todo: hash this
		}, function(err, data){
			if(err){
				console.log(err);
				res.status(500);
				res.send('error');
				return;
			}
			res.send(data);
		});
	});
});

     /////////////////////////////////////////////
    /////////////////////////////////////////////
   ///////////////LOGIN ENDPOINT////////////////
  /////////////////////////////////////////////
 /////////////////////////////////////////////
app.post('/api/login', function(req, res){
	db.collection('users').findOne({
		username: req.body.username,
		password: req.body.password
	}, function(err, data){
		if(data === null){
			res.send('error');
			return;
		}
		// USE SESSION FOR EACH DATA _ID
		req.session.user = {
			_id: data._id,
			username: data.username
		};
		res.send('success');
	});
});

// Chats Submission Endpoint
app.post('/api/newChats', function(req, res){
	// If user is not logged in
	if(!req.session.user){
		res.status(403);
		res.send('forbidden');
		return;
	}
	//if user is logged in insert chat into chats db
	db.collection('chats').insertOne({
		timestamp: Date.now(),
		message: req.body.message,
		type: req.body.type,
		submitter: req.session.user._id,
		username: req.session.user.username 
	});
	res.send("success");

});

     /////////////////////////////////////////////
    /////////////////////////////////////////////
   /////////////////GET CHATS///////////////////
  /////////////////////////////////////////////
 /////////////////////////////////////////////
app.get('/api/getChats', function(req, res){
	// Checks to see if user is logged in
	if(!req.session.user){
		res.status(403);
		res.send('forbidden');
		return;
	}
	// If user logged in send docs
	db.collection('chats').find({}).toArray(function(err, docs){
		if(err){
			return console.log(err);
		}
		res.send(docs);
	});
});

     /////////////////////////////////////////////
    /////////////////////////////////////////////
   ////////////////SERVE STATIC/////////////////
  /////////////////////////////////////////////
 /////////////////////////////////////////////
app.use(express.static('public'));

  //////////////////////
 //////404 ERROR///////
////////////////////// 
app.use(function(req, res, next) {
	res.status(404);
	res.send("File Not Found!");
});

  //////////////////////
 //////500 ERROR///////
////////////////////// 
app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("Internal Server Error!");
	res.send(err);
});

     /////////////////////////////////////////////
    /////////////////////////////////////////////
   //////////////LISTIN IN PORTA////////////////
  /////////////////////////////////////////////
 /////////////////////////////////////////////
function startListening() {
	app.listen(8080, function() {
		console.log("Listin in porta 8080");
	});
}