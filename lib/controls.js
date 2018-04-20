var throttle = require('lodash.throttle')
var Touches = require('touches')
var query = require('./query')

module.exports = Controls

function Controls (client, root) {
  var node = root.querySelector('[name=direction]')
  var sendData = sendForType('tilt', node.querySelector('span'))
  var isSpamMode = 'spam' in query

  if (isSpamMode) {
    var t = 0

    setInterval(function () {
      t += 0.05
      node.classList.add('active')
      sendData(true, Math.sin(t), Math.cos(t))
    }, 1000 / 120)
  }

  button(node, sendData)
  // button(root.querySelector('[name=action]'), sendForType('action'))
  emit = throttle(emit, 1000 / 40, {
    leading: true,
    trailing: true,
  })

  function emit (type, x, y) {
    if (!client.id) return console.warn('missing client.id')
    if (isNaN(x) || isNaN(y)) return console.warn('invalid coord: ' + x + ', ' + y)
    if (!client.hasDoneRoundTrip) return console.warn('messages before roundtrip are blocked')

    x = Math.round(x * 1000) / 1000
    y = Math.round(y * 1000) / 1000
    var message = client.id + '~' + type + '~' + x + '~' + (-y)
    client.emit('client:input', message)
  }

  function sendForType (type, node) {
    return function (enabled, x, y) {
      // semi-normalize (limit length of vector to 1)
      if (!enabled) {
        x = 0
        y = 0
      } else {
        var l = Math.sqrt(x * x + y * y)
        if (l > 1) {
          x /= l
          y /= l
        }
      }

      emit(type, x, y)

      if (!node) return

      var vmin = Math.min(window.innerWidth, window.innerHeight)
      var xf = (x * 0.2 * vmin).toFixed(3)
      var yf = (y * 0.2 * vmin).toFixed(3)

      if (isSpamMode) return
      node.style.transition = 'none'
      node.style.transform = 'translate(' + xf + 'px, ' + yf + 'px)'
    }
  }

  function button (node, signal) {
    var bounds = node.getBoundingClientRect()
    var pressed = false
    var touches = Touches(window, {
      target: node,
      filtered: true,
      preventSimulated: true
    }).on('start', onTouchStart)
      .on('move', onTouchMove)
      .on('end', onTouchEnd)

    function onTouchStart (e, pos) {
      e.preventDefault()
      pressed = true
      bounds = node.getBoundingClientRect()
      onTouchMove(e, pos)
      node.classList.add('active')
    }

    function onTouchMove (e, pos) {
      if (!pressed) return
      var x = (pos[0] / bounds.width - 0.5) * 2
      var y = (pos[1] / bounds.height - 0.5) * 2
      signal(true, x, y)
    }

    function onTouchEnd (e) {
      if (!pressed) return
      node.classList.remove('active')
      pressed = false
      signal(false, 0, 0)
    }
  }
}
