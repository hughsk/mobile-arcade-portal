const { interpolateRainbow } = require('d3-scale-chromatic')
const sourceNames = require('./names')
const express = require('express')
const socketio = require('socket.io')
const through2 = require('through2')
const path = require('path')
const http = require('http')
const net = require('net')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
  wsEngine: 'ws',
  transports: ['websocket', 'polling']
})

const sockets = []
const tcp = net.createServer((client) => {
  const target = through2()

  target.pipe(client)
  sockets.push(target)

  client.setNoDelay(true)
  client.once('close', () => {
    var idx = sockets.indexOf(client)
    if (idx !== -1) sockets.splice(client, 1)
  })

  var players = io.of('player').connected

  console.log('Game started!')
  console.log('Existing players and their colours/names requested')

  for (var id in players) {
    if (!colorLUT[id]) continue
    broadcast('client-connect:' + JSON.stringify(toRGB(id, colorLUT[id], nameLUT[id])))
  }
}).once('error', (err) => {
  throw err
}).listen(3001, () => {
  console.log(' tcp://localhost:3001/')
})

app.use(express.static(path.resolve(__dirname, 'static')))

server.listen(3000, (err) => {
  if (err) throw err
  console.log('http://localhost:3000/')
})

const channelPlayer = io.of('/player')
const colors = []
var names = []

const colorLUT = {}
const nameLUT = {}
delete colorLUT.x
delete nameLUT.x

channelPlayer.on('connection', (client) => {
  var color = colorLUT[client.id] = getRandomColor()
  var name = nameLUT[client.id] = getRandomName()

  // broadcast color/name to game clients
  broadcast('client-connect:' + JSON.stringify(toRGB(client.id, color, name)))

  // detect disconnection and broadcast to game
  client.on('disconnect', () => {
    delete colorLUT[color]
    delete nameLUT[color]
    colors.push(color)
    names.push(name)
    broadcast('client-disconnect:' + client.id)
  })

  // broadcast input events
  client.on('client:input', (data) => {
    broadcast('ci:' + data)
  })

  // pass color to client on first connection
  client.emit('client:color', toRGB(client.id, color, name))

  // roundtrip request for confirming the connection is working
  client.on('client:roundtrip', (data, next) => {
    next()
  })
})

io.on('connection', (server) => {
  console.log("HOST CONNECTED", server.id, server.nsp.name)
})

function getRandomColor () {
  if (colors.length <= 0) populateColors()
  var idx = Math.floor(Math.random() * colors.length)
  var col = colors.splice(idx, 1)
  return col[0]
}

function getRandomName () {
  if (names.length <= 0) populateNames()
  var idx = Math.floor(Math.random() * names.length)
  var name = names.splice(idx, 1)
  return name[0]
}

// splits rgb(r, g, b) into an object for passing onto unity
function toRGB (id, color, name) {
  color = color.match(/rgb\(([0-9, ]+)\)/)[1].split(/,\s+/g)
  return {
    id: id,
    red: parseInt(color[0], 10),
    green: parseInt(color[1], 10),
    blue: parseInt(color[2], 10),
    name: name
  }
}

var colorCount = 12

function populateColors () {
  for (var i = 0; i < colorCount; i++) {
    colors[i] = interpolateRainbow(i / colorCount)
  }
}

function populateNames () {
  names = sourceNames.slice()
}

function broadcast (data) {
  data = String(data)

  for (var i = 0; i < sockets.length; i++) {
    sockets[i].push(data + '\n')
  }
}
