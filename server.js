var express = require('express'), 
	port = process.env.port || 8080, 
	app = express()

app.set('views', __dirname + '/views')

app.use('/',	express.static( __dirname + '/html' ))
app.use('/js',	express.static( __dirname + '/js' ))
app.use('/css',	express.static( __dirname + '/css' ))
app.use('/img', express.static( __dirname + '/img' ))
app.use('/audio', express.static( __dirname + '/audio' ))

app.listen(port)

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown"); 