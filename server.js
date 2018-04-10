const { interpolateRainbow } = require('d3-scale-chromatic')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.resolve(__dirname, 'static')))

server.listen(80, (err) => {
  if (err) throw err
  console.log('http://localhost:3000/')
})

const channelPlayer = io.of('/player')
const colors = []

channelPlayer.on('connection', (client) => {
  var color = getRandomColor()

  io.emit('client:connect', toRGB(client.id, color))
  client.emit('client:color', toRGB(client.id, color))
  client.on('disconnect', () => {
    colors.push(color)
    io.emit('client:disconnect', client.id)
  })

  client.on('client:input', (data) => {
    //console.log(data)
    io.emit('client:input', data)
  })
})

io.on('connection', (client) => {
  console.log("HOST CONNECTED", client.id, client.nsp.name)
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
