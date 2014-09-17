
/**
 * 依赖模块
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//使用ejs模板，并修改扩展名为html
app.engine('.html',require('ejs').renderFile);
app.set('view engine', 'html');
//app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use([path],function) 用于加载处理http请求的中间件，相当于注册请求的拦截器（函数）
//这些拦截器是函数，形式为function(req,res,next){...;next();}
//自定义网站图标
app.use(express.favicon(path.join(__dirname,'/public/images/favicon.ico')));
//可以在console中输出简单log
app.use(express.logger('dev'));
//用于解析request
//app.use(express.bodyParser())相当于以下代码
//-----------//
//app.use(express.json());
//app.use(express.urlencoded());
//appuse(express.multipart());
//-----------//
app.use(express.bodyParser());
//协助处理POST请求，伪装成PUT、DELETE等
app.use(express.methodOverride());

//调用路由解析规则，一般注册其他的
app.use(app.router);
//设置静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
//将路由控制和实现都放在index.js中
routes(app);
