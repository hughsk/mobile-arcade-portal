const { interpolateRainbow } = require('d3-scale-chromatic')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
  wsEngine: 'ws',
  transports: ['websocket', 'polling']
})

app.use(express.static(path.resolve(__dirname, 'static')))

server.listen(3000, (err) => {
  if (err) throw err
  console.log('http://localhost:3000/')
})

const channelPlayer = io.of('/player')
const colors = []

const colorLUT = {}
delete colorLUT.x

channelPlayer.on('connection', (client) => {
  var color = colorLUT[client.id] = getRandomColor()

  // broadcast color to game clients
  io.emit('client:connect', toRGB(client.id, color))

  // detect disconnection and broadcast to game
  client.on('disconnect', () => {
    delete colorLUT[color]
    colors.push(color)
    io.emit('client:disconnect', client.id)
  })

  // broadcast input events
  client.on('client:input', (data) => {
    io.emit('client:input', data)
  })

  // pass color to client on first connection
  client.emit('client:color', toRGB(client.id, color))

  // roundtrip request for confirming the connection is working
  client.on('client:roundtrip', (data, next) => {
    next()
  })
})

io.on('connection', (server) => {
  console.log("HOST CONNECTED", server.id, server.nsp.name)

  server.on('server:populate', (_, next) => {
    var players = io.of('player').connected

    console.log('Game started!')
    console.log('Existing players and their colours requested')

    for (var id in players) {
      if (!colorLUT[id]) continue
      server.emit('client:connect', toRGB(id, colorLUT[id]))
    }

    server.once('disconnect', () => {
      console.log('disconnected :O')
    })
  })

  server.on('server:keepalive', () => {
    console.log('server keepalive fired')
  })
})

function getRandomColor () {
  if (colors.length <= 0) populateColors()
  var idx = Math.floor(Math.random() * colors.length)
  var col = colors.splice(idx, 1)
  return col[0]
}

// splits rgb(r, g, b) into an object for passing onto unity
function toRGB (id, color) {
  color = color.match(/rgb\(([0-9, ]+)\)/)[1].split(/,\s+/g)
  return {
    id: id,
    red: parseInt(color[0], 10),
    green: parseInt(color[1], 10),
    blue: parseInt(color[2], 10)
  }
}

var colorCount = 12

function populateColors () {
  for (var i = 0; i < colorCount; i++) {
    colors[i] = interpolateRainbow(i / colorCount)
  }
}
