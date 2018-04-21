// var fulltilt = require('@hughsk/fulltilt/dist/fulltilt.js')
var Sections = require('./lib/sections')
var Controls = require('./lib/controls')

var HOST = window.location.protocol + '//' + window.location.host + '/player'
var client = require('socket.io-client')(HOST, {
  transports: ['websocket', 'polling']
})

console.log(HOST)

window.onerror = function (e) { alert(e.message || e) }
window.addEventListener('gesturestart', function (e) {
  return e.preventDefault()
}, false)

var introSubtitle = document.querySelector('section[name=intro] h2')
var changeSection = Sections('intro')
var controls = Controls(client, document.querySelector('section[name=controller]'))

client.once('connect', function () {
  client.on('client:color', function (color) {
    document.body.style.backgroundColor = 'rgb(' + [color.red, color.green, color.blue].join(', ') + ')'

    client.emit('client:roundtrip', client.id, function () {
      client.hasDoneRoundTrip = true
      setTimeout(changeSection.bind(null, 'controller'))
    })
  })
})

function tapToContinue (e) {
  e.preventDefault()
  window.removeEventListener('click', tapToContinue, false)
  window.removeEventListener('ontouchstart', tapToContinue, false)
  window.removeEventListener('ontouchend', tapToContinue, false)
}
