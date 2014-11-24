var crypto = require('crypto');
var fs = require('fs');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');

module.exports = function(app) {
	// app.get('/',function(req,res){
	// res.render('index',{title:'我是谁?'});
	// });
	app.get('/user/name/:name', function(req, res) {
		var name = req.param('name');
		res.render('index', {
			title : 'name is' + name
		});
	});
	app.get('/user/:age', function(req, res) {
		var age = req.param('age');
		res.render('index', {
			title : 'age is ' + age
		});
	});
	app.get('/book/:name/:price', function(req, res) {
		var name = req.param('name');
		var price = req.param('price');
		res.render('index', {
			title : 'book name is ' + name + ', price is ' + price
		});
	});
	app.get('/', function(req, res) {
//		Post.getAll(null, function(err, posts) {
//			if (err) {
//				posts = [];
//				return res.redirect('back');
//			}
//			res.render('index', {
//				title : '主页',
//				user : req.session.user,
//				success : req.flash('success').toString(),
//				error : req.flash('error').toString(),
//				posts : posts
//			});
//		});
		var page = req.query.p ? parseInt(req.query.p) : 1;
		Post.getByPaging(null, page,function(err, posts,total) {
			if (err) {
				posts = [];
//				return res.redirect('back');
			}
			res.render('index', {
				title : '主页',
				posts : posts,
				page : page,
				total : total,
				isFirstPage : (page - 1) == 0,
				isLastPage : ((page - 1) * 10 + posts.length ) == total,
				user : req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
				
			});
		});
	});

	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title : '注册',
			user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});
	app.get('/reg', checkNotLogin);
	app
			.post(
					'/reg',
					function(req, res) {
						var name = req.body.name, password = req.body.password, password_repeat = req.body['password-repeat'];
						if (password_repeat !== password) {
							req.flash('error', '两次输入的密码不一致');
							return res.redirect('/reg');
						}
						var md5 = crypto.createHash('md5');
						password = md5.update(password).digest('hex');
						var email = req.body.email;
						var newUser = new User({
							name : name,
							password : password,
							email : email
						});
						User.get(newUser.name, function(err, user) {
							if (user) {
								req.flash('error', '用户已存在。');
								return res.redirect('/reg');
							}
							newUser.save(function(err, user) {
								if (err) {
									req.flash('error', err);
									return res.redirect('/reg');
								}
								req.session.user = user;
								req.flash('success', '注册成功');
								res.redirect('/');
							});
						});
					});
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		res.render('login', {
			title : '登录',
			user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});
	app.get('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		var md5 = crypto.createHash('md5');
		var password = req.body.password;
		password = md5.update(password).digest('hex');
		var name = req.body.name;
		User.get(name, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				res.redirect('/login');
			}
			if (user.password !== password) {
				req.flash('error', '密码错误');
				res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', '登陆成功');
			res.redirect('/');
		});
	});

	app.get('/post', checkLogin);
	app.get('/post', function(req, res) {
		res.render('post', {
			title : '发表',
			user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});

	app.get('/post', checkLogin);
	app.post('/post', function(req, res) {
		var currentUser = req.session.user;
		var tags = [req.body.tag1,req.body.tag2,req.body.tag3];
		var post = new Post(currentUser.name,currentUser.head,req.body.title, tags,req.body.post);
		post.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', '发表成功');
			res.redirect('/');
		});
	});

	app.get('/logout', function(req, res) {
		req.session.user = null;
		req.flash('success', '登出成功');
		res.redirect('/');
	});
	app.get('/upload', checkLogin);
	app.get('/upload', function(req, res) {
		res.render('upload', {
			title : '文件上传',
			user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});

	app.post('/upload', checkLogin);
	app.post('/upload', function(req, res) {
		for ( var i in req.files) {
			if (req.files[i].size == 0) {
				// 使用同步方式删除一个文件
				fs.unlinkSync(req.files[i].path);
				console.log('Successfully removed an empty file.');
			} else {
				var targetPath = './public/upload/' + req.files[i].name;
				// 使用同步方式重命名一个文件
				fs.renameSync(req.files[i].path, targetPath);
				console.log('Successfully rename a file.');
			}
		}
		req.flash('success', '文件上传成功');
		res.redirect('/upload');
	});
	
	app.get('/archive',function(req,res){
		Post.getAllArchive(function(err,posts){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('archive',{
				title : '归档',
				posts : posts,
				user : req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});
	
	//到标签页
	app.get('/tags',function(req,res){
		Post.getTags(function(err,posts){
			if(err){
				console.log('err1======'+err);
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('tags',{
				title : '标签',
				posts : posts,
				user : req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});
	
	//到指定tag的文章页
	app.get('/tags/:tag',function(req,res){
		var tag = req.params.tag;
		Post.getTag(tag,function(err,posts){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			res.render('tag',{
				title : 'TAG:' + tag,
				posts : posts,
				user : req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});
	
	app.get('/links',function(req,res){
		res.render('links',{
			title : '友情链接',
			user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});
	
	app.get('/search',function(req,res){
		var keyword = req.query.keyword;
		Post.search(keyword,function(err,posts){
			if(err){
				req.flash('error',error);
				return callback('/');
			}
			res.render('search',{
				title : 'SEARCH:' + keyword,
				posts : posts,
				user : req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});

	app.get('/u/:name', function(req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		User.get(req.params.name, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在！');
				return res.redirect('/');
			}
			Post.getByPaging(user.name,page, function(err, posts,total) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title : user.name + '的blog',
					posts : posts,
					total : total,
					page : page,
					isFirstPage : (page - 1) == 0,
					isLastPage : ((page - 1) * 10 + posts.length ) == total,
					user : req.session.user,
					success : req.flash('success').toString(),
					error : req.flash('error').toString()
				});
			});
			// 根据用户名查询文章
//			Post.getAll(req.params.name, function(err, posts) {
//				if (err) {
//					req.flash('error', err);
//					return res.redirect('/');
//				}
//				res.render('user', {
//					title : user.name + '的blog',
//					posts : posts,
//					user : req.session.user,
//					success : req.flash('success').toString(),
//					error : req.flash('error').toString()
//				});
//			});
		});
	});

	//根据用户名、日期和标题查询一个文章
	app.get('/u/:name/:day/:title', function(req, res) {
		Post.getOneInHtml(req.params.name, req.params.day, req.params.title,
				function(err, post) {
					if (err) {
						req.flash('error', err);
						return res.redirect('/');
					}
					res.render('article', {
						title : req.params.title,
						post : post,
						user : req.session.user,
						success : req.flash('success').toString(),
						error : req.flash('error').toString()
					});
				});
	});
	//为文章添加留言
	app.post('/u/:name/:day/:title', function(req, res) {
		var date = new Date();
		var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() );
		var md5 = crypto.createHash('md5');
		var emailMd5 = md5.update(req.body.email.toLowerCase()).digest('hex');
		var head = "http://www.gravatar.com/avatar/"+ emailMd5 + ".json";
		var comment = {
				name : req.body.name,
				head : head,
				email : req.body.email,
				website : req.body.website,
				time : time,
				content : req.body.content
		};
		var newComment = new Comment(req.params.name,req.params.day,req.params.title,comment);
		newComment.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','留言成功');
			res.redirect('back');
		});
	});
	app.get('/edit/:name/:day/:title', checkLogin);
	app.get('/edit/:name/:day/:title', function(req, res) {
		console.log('day>'+req.params.day);
		console.log('title>'+req.params.title);
		
		var currentUser = req.session.user;
		Post.getInMarkdown(currentUser.name, req.params.day, req.params.title,
				function(err, post) {
					if (err) {
						req.flash('error', err);
						return res.redirect('back');
					}
					console.log('post>'+post);
					res.render('edit', {
						title : '编辑',
						post : post,
						user : req.session.user,
						success : req.flash('success').toString(),
						error : req.flash('error').toString()
					});
				});
	});

	
	app.post('/edit/:name/:day/:title', checkLogin);
	app.post('/edit/:name/:day/:title', function(req, res) {
		console.log('day>'+req.params.day);
		console.log('title>'+req.params.title);
		
		var currentUser = req.session.user;
		Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function(err){
			var url = '/u/'+req.params.name + '/' + req.params.day + '/' + req.params.title;
			console.log('url>'+url);
			if(err){
				req.flash('error',err);
				return res.redirect(url);
			}
			req.flash('success','修改成功');
			res.redirect(url);
		});
	});
	
	app.get('/remove/:name/:day/:title', checkLogin);
	app.get('/remove/:name/:day/:title', function(req, res) {
		console.log('day>'+req.params.day);
		console.log('title>'+req.params.title);
		
		var currentUser = req.session.user;
		Post.remove(currentUser.name,req.params.day,req.params.title,function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','修改成功');
			res.redirect('/');
		});
	});
	app.use(function(req,res){
		res.render('404',{
			title : '呀，迷路了...',
			user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录');
			res.redirect('/login');
		}
		next();
	}
	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录');
			res.redirect('back');
		}
		next();
	}
};