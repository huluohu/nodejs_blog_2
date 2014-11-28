Handlebars.registerHelper('ifeq',function(a,b,options){
	if(a === b){
		options.fn(this);
	}else{
		options.inverse(this);
	}
});