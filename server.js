var express = require('express')
    , app = express()
    , port = process.env.PORT || 3000
    , router = express.Router();

app.use(express.static(__dirname + '/'));

router.get('/', function(req, res, next) {
    res.render('index.html');
});

app.use('/', router);

app.listen(port);
console.log('App running on port', port);