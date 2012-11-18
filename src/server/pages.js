module.exports = function setupPages(app){

	//views are located relative to this file
	app.set('views', __dirname + '/views')
	
	//use Jade as the view engine
	app.engine('jade', require('jade').__express)
	
	//pass {pretty: true} to the Jade renderer
	app.locals.pretty = true
	
	function serveJade(route, file, opts){
		app.get(route, function(req, res){
			res.render(file, opts)
		})
	}
	
	serveJade('/', 'index.jade')
	serveJade('/test', 'test.jade')
	
}