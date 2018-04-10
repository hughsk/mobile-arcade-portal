// const fulltilt = require('@hughsk/fulltilt/dist/fulltilt.js')
const Sections = require('./lib/sections')
const Controls = require('./lib/controls')

const HOST = window.location.protocol + '//' + window.location.host + '/player'
const client = require('socket.io-client')(HOST)

console.log(HOST)

window.onerror = function (e) { alert(e.message || e) }
window.addEventListener('gesturestart', function (e) {
  return e.preventDefault()
}, false)

const introSubtitle = document.querySelector('section[name=intro] h2')
const changeSection = Sections('intro')
const controls = Controls(client, document.querySelector('section[name=controller]'))

client.once('connect', function () {
  // introSubtitle.innerHTML = 'tap to continue...'
  setTimeout(changeSection.bind(null, 'controller'))
  // window.addEventListener('click', tapToContinue, false)
  // window.addEventListener('ontouchstart', tapToContinue, false)
  // window.addEventListener('ontouchend', tapToContinue, false)

  client.on('client:color', function (color) {
    document.body.style.backgroundColor = 'rgb(' + [color.red, color.green, color.blue].join(', ') + ')'
  })
})

function tapToContinue (e) {
  e.preventDefault()
  window.removeEventListener('click', tapToContinue, false)
  window.removeEventListener('ontouchstart', tapToContinue, false)
  window.removeEventListener('ontouchend', tapToContinue, false)
}


  // var orientation = null
  // window.onclick = null
  // var baseEuler = null

  // h1.innerHTML = 'clicked'
  // new FULLTILT.getDeviceOrientation({
  //   type: 'world'
  // }).then(function (controller) {
  //   orientation = controller
  //   h1.innerHTML = 'orientation accessed'
  // }).catch(function (e) {
  //   alert(e.message || e)
  // })

  // var axes = [0, 0]
  // var data = {
  //   id: null,
  //   type: null,
  //   xInput: 0,
  //   yInput: 0,
  // }

  // draw()
  // function draw () {
  //   requestAnimationFrame(draw)

  //   if (!orientation) return
  //   if (!client.id) return

  //   var euler = orientation.getScreenAdjustedEuler()

  //   if (!baseEuler) {
  //     baseEuler = [euler.gamma, euler.beta]
  //   }

  //   axes[0] = clamp((euler.gamma - baseEuler[0]) / 50)
  //   axes[1] = -clamp(((euler.beta - baseEuler[1])) / 50)

  //   data.id = client.id
  //   data.type = 'tilt'
  //   data.xInput = axes[0]
  //   data.yInput = axes[1]

  //   client.emit('client:input', data)

  //   h2.innerHTML = JSON.stringify(data)
  // }

  // function clamp (a) {
  //   return Math.max(-1, Math.min(a, +1))
  // }