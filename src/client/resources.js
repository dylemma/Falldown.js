var express = require('express')

module.exports = function setupResources(app){
	app.use('/js', express.static( __dirname + '/js' ))
	app.use('/audio', express.static( __dirname + '/audio' ))
	app.use('/css', express.static( __dirname + '/css'))
}