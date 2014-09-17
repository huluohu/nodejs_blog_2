module.exports = function(app){
	app.get('/',function(req,res){
		res.render('index',{title:'我是谁?'});
	});
	app.get('/user/name/:name',function(req,res){
		var name = req.param('name');
		res.render('index',{title:'name is' + name});
	});
	app.get('/user/:age',function(req,res){
		var age = req.param('age');
		res.render('index',{title:'age is '+ age});
	});
	app.get('/book/:name/:price',function(req,res){
		var name = req.param('name');
		var price = req.param('price');
		res.render('index',{title:'book name is '+ name + ', price is ' + price});
	});
}