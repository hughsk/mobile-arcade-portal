var qs = require('querystring')

module.exports = qs.parse(String(window.location.search).slice(1))
