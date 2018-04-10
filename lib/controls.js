var Touches = require('touches')

module.exports = Controls

function Controls (client, root) {
  var node = root.querySelector('[name=direction]')

  button(node, sendForType('tilt', node.querySelector('span')))
  // button(root.querySelector('[name=action]'), sendForType('action'))

  function sendForType (type, node) {
    return function (enabled, x, y) {
      // semi-normalize (limit length of vector to 1)
      var l = Math.sqrt(x * x + y * y)
      if (l > 1) {
        x /= l
        y /= l
      } else {
      }

      client.emit('client:input', {
        id: client.id,
        type: type,
        xInput: x,
        yInput: -y
      })

      if (!node) return

      var vmin = Math.min(window.innerWidth, window.innerHeight)
      var xf = (x * 0.2 * vmin).toFixed(3)
      var yf = (y * 0.2 * vmin).toFixed(3)

      // node.style.position = 'relative'
      node.style.transform = 'translate(' + xf + 'px, ' + yf + 'px)'
    }
  }

  function button (node, signal) {
    var bounds = node.getBoundingClientRect()
    var pressed = {}
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