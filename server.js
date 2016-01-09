var express = require('express');
var bodyParser = require('body-parser')
var Firebase = require('firebase');
var app = express();
var port = process.env.PORT || 3000;
var router = express.Router();

app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.get('/', function(req, res, next) {
    res.render('index.html');
});

router.post('/api/add-race', function(req, res) {
	console.log('POST /');
	console.dir(req.body);

	if (req.body.racename && req.body.date && req.body.overall && req.body.swim && req.body.bike && req.body.run && req.body.password) {

		if (req.body.password == "addrace") {

			var ref = new Firebase('https://daniel-cantwell.firebaseio.com');
		    var racesRef = ref.child('races');

		    var r1 = {
		        name: req.body.racename,
		        date: req.body.date,
		        overall: req.body.overall,
		        swim: req.body.swim,
		        bike: req.body.bike,
		        run: req.body.run
		    };

		    racesRef.push(r1);
		    console.log("pushed data to firebase");
			res.end('{"success" : "Uploaded Successfully", "status" : 200}');
		} else {
			res.end('{"error" : "Wrong Password", "status" : 400}');
		}

	} else {
		res.end('{"error" : "Invalid Parameters", "status" : 400}');
	}
});

app.use('/', router);

app.listen(port);
console.log('App running on port', port);