
/**
 * 依赖模块
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , test = require('./routes/test')
  , http = require('http')
  , path = require('path');

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log',{flag : 'a'});
var errorLog = fs.createWriteStream('error.log',{flag : 'a'});

var app = express();

var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

var exphbs = require('express3-handlebars');

app.use(flash());
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//使用ejs模板，并修改扩展名为html
//app.engine('.html',require('ejs').renderFile);
//app.set('view engine', 'html');

//app.set('view engine', 'ejs');

//设置handlebars作为模板引擎
app.engine('hbs',exphbs({
	//设置模板目录
	layoutsDir : 'views/hbs',
	//设置页面布局的layout.html文件
	defaultLayout : 'layout',
	//设置页面扩展名
	extname : '.html'
}));
app.set('view engine','hbs');


//app.use(express.favicon());
//app.use([path],function) 用于加载处理http请求的中间件，相当于注册请求的拦截器（函数）
//这些拦截器是函数，形式为function(req,res,next){...;next();}
//自定义网站图标
app.use(express.favicon(path.join(__dirname,'/public/images/favicon.ico')));
//可以在console中输出简单log
app.use(express.logger('dev'));
//将访问日志输出到文件
app.use(express.logger({stream : accessLog}));
//用于解析request
//app.use(express.bodyParser())相当于以下代码
//-----------//
//app.use(express.json());
//app.use(express.urlencoded());
//appuse(express.multipart());
//-----------//
app.use(express.bodyParser({keepExtensions:true,uploadDir:'./public/upload'}));
//协助处理POST请求，伪装成PUT、DELETE等
app.use(express.methodOverride());

//cookie解析中间件
app.use(express.cookieParser());
//设置会话支持
app.use(express.session({
	secret : settings.cookieSecret,
	key : settings.db,//cookie name
	cookie : {maxAge : 1000 * 60 * 60 * 24 * 30},//30days
	store : new MongoStore({db : settings.db})//会话信息存储在db中
}));

//初始化passport
app.use(passport.initialize());

//调用路由解析规则，一般注册其他的
app.use(app.router);
//设置静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err,req,res,next){
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLog.write(meta + err.stack + '\n');
	next();
});
//设置passport策略
passport.use(new GitHubStrategy({
	clientID : 'd509b16757dade90cc47',
	clientSecret : "07dc0aa575db4bfa1045c9f99cb27991d088b4df",
	callbackURL : 'http://localhost:3000/login/github/callback'
},function(accessToken,refreshToken,profile,done){
	done(null,profile);
}));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  console.log('哈哈哈，不错吧！');
});
//将路由控制和实现都放在index.js中
routes(app);
