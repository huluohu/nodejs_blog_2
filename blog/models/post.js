/**
 * New node file
 */
var mongodb = require('./db');
var markdown = require('markdown').markdown;
function Post(name,title,post){
	this.name = name;
	this.title = title;
	this.post = post;
}
module.exports = Post;

/**
 * 保存文章函数
 * @param callback
 */
Post.prototype.save = function(callback){
	var date = new Date();
	var time = {
			date : date,
			year : date.getFullYear(),
			month : date.getFullYear() + '-' + (date.getMonth() + 1),
			day : date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
			minute : date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() )
	};
	console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+time.minute);
	var post = {
			name : this.name,
			time : time,
			title : this.title,
			post : this.post
	};
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(post,{safe:true},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};
//获取一个人的全部文章（传入name），或获取所有人的文章
Post.getAll = function(name,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(name){
				query.name = name;
			}
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				docs.forEach(function(doc){
					doc.post = markdown.toHTML(doc.post);
				});
				callback(null,docs);
			});
		});
	});
};
//根据用户名、发布日期和文章名获取一篇文章
Post.getOne = function(name,day,title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//根据用户名、发布日期和文章名进行查询
			collection.findOne({
				'name' : name,
				'time.day' : day,
				'title' : title
			},function(err,doc){
				mongodb.close();
				if(err){
					return callback(err);
				}
				doc.post = markdown.toHTML(doc.post);
				callback(null,doc);
			});
		});
	});
};

//根据用户名、日期和文章名查询文章，返回markdown格式
Post.getInMarkdown = function(name,day,title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				'name' : name,
				'time.day' : day,
				'title' : title
			},function(err,doc){
				mongodb.close();
				if(err){
					return callback(err);
				}
				console.log('doc>'+doc);
				callback(null,doc);
			});
		});
	});
};

Post.update = function(name,day,title,post,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.update({
				'name' : name,
				'time.day' : day,
				'title' : title
			},{
				$set : {post : post}
			},
			function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

Post.remove = function(name,day,title,callback){
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.remove({
				'name' : name,
				'time.day' : day,
				'title' :title
			},{
				w : 1
			},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};