var fis = module.exports = require('fis');

fis.name = 'lol';
fis.require.prefixes = [ 'lol', 'fis' ];
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');
fis.cli.help.commands = [ 'release', 'install', 'server', 'init' ];

var beautify = require('js-beautify').js_beautify;


// 配置
fis.config.merge({
	project: {
		exclude: ['tests/**']
	},
	roadmap: {		
		path: [
            {
                reg : /^\/modules\/([^\/]+)\/index\.(js)$/i,
                isMod : true,
                id : '$1',
                release : '$&'
            },
            {
                reg : /^\/modules\/(.*)\.(js)$/i,
                isMod : true,
                id : '$1',
                release : '$&'
            },
            {
                reg : /^\/lego_modules\/([^\/]+)\/(\d+\.\d+\.\d+)\/index\.(js)$/i,
                isMod : true,
                id : '$1',
                release : '$&'
            },
            {
                reg : /^\/lego_modules\/([^\/]+)\/(\d+\.\d+\.\d+)\/(.*)\.(js)$/i,
                isMod : true,
                id : '$1/$3',
                release : '$&'
            }		
		]
	},
	modules: {
		postprocessor: {
			js: ['jswrapper', 'require-async', function(content, file, conf){
                
                // if(file.subpath.indexOf('/modules/')!=-1){  // 业务组件
                //     var reg = /require\('([^'"]+)'\)/g;
                //     var matches = null;
                //     while( (matches = reg.exec(content)) ){
                //         !file.extra && (file.extra = {});
                //         !file.extra.requires && (file.extra.requires = []);
                //         file.extra.requires.push(matches[1]);
                //     }                    
                // }

                return content;
            }],
            html: ['require-async', function(content, file, conf){
                
                // content = content.replace(/require\.async\((\[[^\[\]]+\])/g, function(matchword, $1){
                //     console.log($1);
                //     return matchword;
                // });
                return content;
            }]
		},
        postpackager: function(ret, conf, settings, opt){                
            
            var alias = {};
            var moduleAlias = {};
            var legoAlias = {};
            var projectPath = fis.project.getProjectPath();
            var subpath = '';

            fis.util.map(ret.src, function (subpath, file) {                
                
                if(file.isJsLike && file.isMod){

                    if(subpath.match(/^\/modules\//)){
                        moduleAlias[file.id] = {
                            url: file.url,
                            deps: file.requires
                        }; 
                    }

                    if(subpath.match(/^\/lego_modules\//)){
                        legoAlias[file.id] = {
                            url: file.url,
                            deps: file.requires
                        }; 
                    }                    
                }             
            });

            alias = fis.util.merge(legoAlias, moduleAlias);                                      

            fis.util.map(ret.src, function(subpath, file){
                if(file.isHtmlLike && 
                    file.extras && 
                    file.extras.async && 
                    file.extras.async.length){
                    
                    var content = file.getContent();
                    file.setContent(content.replace(/<\/head>/, '<script>require.resourceMap({res:'+ beautify(JSON.stringify(alias), { indent_size: 2 }) +'})</script>$&'));
                }
            });
        }
	},
	settings: {
		postprocessor : {
            jswrapper : {
            	type: 'amd',
            	wrapAll: false
                // template : 'try{ ${content} }catch(e){ e.message += "${id}"; throw e; }'
            }
        }
	}
});