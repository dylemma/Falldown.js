var setupPages = require('./pages')
var setupResources = require('../client/resources')

function runServer(){
	var express = require('express'), 
		port = process.env.port || 9090, 
		app = express()
	
	app.use(function(req, res, next){
		console.log('%s %s', req.method, req.url)
		next()
	})
	
	setupPages(app)
	setupResources(app)

	/*
	app.use('/js',	express.static( __dirname + '/js' ))
	app.use('/css',	express.static( __dirname + '/css' ))
	app.use('/img', express.static( __dirname + '/img' ))
	app.use('/audio', express.static( __dirname + '/audio' ))
	app.use('/',	express.static( __dirname + '/html' ))
	*/
	console.log('js @ ' + __dirname + "/../client/js")
	app.use('/js', express.static( __dirname + '../client/js'))

	app.listen(port)

	console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown"); 
}

module.exports = runServer