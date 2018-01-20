const express = require('express')
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const Game = require('./game');

const app = express();

const sslOptions = {
  cert: fs.readFileSync('./fullchain.pem'),
  key: fs.readFileSync('./privkey.pem')
};

const server = http.createServer(app);
const secureServer = https.createServer(sslOptions, app)
const wss = new WebSocket.Server({ server: secureServer });
const rummy = new Game(wss);

app.use(express.static('public'));

wss.on('error', () => console.log('*errored*'));
wss.on('close', () => console.log('*disconnected*'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/join/:lobby', function(req, res) {
  let code = req.params.lobby;
  if (rummy.addLobby(code)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/');
  }
});

app.get('/joincpu/:lobby', function(req, res) {
  let code = req.params.lobby;
  if (rummy.addLobby(code, cpu=true)) {
    res.redirect('/game/' + req.params.lobby + '/' + rummy.lobbys[code].token);
  } else {
    res.redirect('/');
  }
});

app.get('/game/:lobby/:token', function(req, res) {
  let code = "" + req.params.lobby,
      token = req.params.token;
  if (req.params.token && rummy.lobbys[code] && rummy.lobbys[code].token == token) {
    res.sendFile(__dirname + '/public/game.html');
  } else {
    res.redirect('/');
  }
});

server.listen(5000, () => {
  console.log('Listening on port 5000...')
});
secureServer.listen(443, () => {
  console.log('(Secure) Listening on port 443...')
});
