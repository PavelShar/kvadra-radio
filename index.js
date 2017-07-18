let moment = require('moment')
let app = require('express')()
let server = require('http').Server(app);
let io = require('socket.io')(server);

server.listen(80);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


var volume = 0.5;
var timeout = 15;
var currentSong = "";
// id, disliked, lastRequest
var clients = [];

app.get('/currentState', function (req, res) {
	// -> song
	// <- volume:ToDo, skip:Bool
	var oldSong = currentSong;
	if (currentSong != req.query.song) {
		for (var index in clients) {
			clients[index].disliked = false;
		}
	}
	currentSong = req.query.song;
	var resp = {
		skip: clients.length / 2 <= numOfDislikes(),
		volume: volume,
		song: oldSong
	};

	res.json(resp);
})

app.get('/getState', function (req, res) {
	// -> id
	// <- songName, dislikes, volume: ToDo, clientId
	var id = null;
	if (req.query.clientId == -1) {
		var newId = getRandomClientId();
		clients.push({
			id: newId,
			disliked: false,
			lastRequest: new Date()
		});
		id = newId;
	} else {
		id = req.query.clientId;
		for (var index in clients) {
			if (!moment(clients[index].lastRequest).add(15, 's').isSameOrAfter(moment())) {
				clients.splice(index,1)
			}
			if (clients[index].id == req.query.clientId) {
				clients[index].lastRequest = new Date();
			}
		}
	}

	res.json({
		clientId: id,
		song: currentSong,
		dislikes: numOfDislikes(),
		usersNum: clients.length
	});
})

app.get('/dislike', function (req, res) {
	// -> id
	// <- disliked
	for (var index in clients) {
		// check if timeout clients
		if (clients[index].id == req.query.clientId) {
			clients[index].disliked = true;
		}
	}

	res.json({
		song: currentSong,
		dislikes: numOfDislikes()
	});
})

app.get('/setVolume', function (req, res) {
	volume = req.query.volume;

	res.json({});
})


app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

function numOfDislikes() {
	var dislikes = 0;
	clients.map(client => client.disliked ? dislikes += 1 : null);
	return dislikes;
}

function getRandomClientId() {
  return Math.floor(Math.random() * (99999 - 1)) + 1;
}

