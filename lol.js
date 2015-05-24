var fis = module.exports = require('fis');

fis.name = 'lol';
fis.require.prefixes = [ 'lol', 'fis' ];
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');
fis.cli.help.commands = [ 'release', 'install', 'server', 'init' ];

var beautify = require('js-beautify').js_beautify;
    resourceMap = 'resourceMap.json',
    mm = require('micromatch');

/**
 * 找到name对应模块的依赖模块
 * @param {String} name
 * @param {Object} sourceMap 
 * @return {String}
*/
function findDeps(name, sourceMap){
    var res = sourceMap[name],
        ret = [sourceMap[name]];

    fis.util.map(res.deps, function(index, id){
        ret = ret.concat(findDeps(id, sourceMap));
    });
    return ret;
}

function getConcatList(deps) {
    var ret = [],
        throhold = 1024 * 100,
        file = null;

    fis.util.map(deps, function(index, dep){
        file = fis.file(dep.subpath);
        // console.log(file);
    });
}

/**
 * 获取lego模块的版本
 * @return {String}
 */
function getLegoVersion(){
    return '1.9.1';
}

/**
 * 使用业务模块，还是生态模块。优先用业务模块
 * @return {String}
 */
function getModuleType(){
    return 'module';
}

/**
 * 是否内部模块
 * @return {Boolean} 
 */
function isInnerModule(){
    return false;
}

/**
 * 获取模块主入口文件，默认是 index.js
 * @return {String}
 */
function getModuleMainFile(){
    return 'index.js';
}

/**
 * [getAlias description]
 * @return {[type]} [description]
 */
function getAlias(ret){
    
    var result = {};    
    var reg = /lego_modules\/(.*)\/(.*)\/package\.json/;
    var match = null;
    var projPackageJson = JSON.parse(ret.src['/package.json'].getContent());
    var dependencies = projPackageJson.lego.dependencies || {};

    fis.util.map(ret.src, function (subpath, file) {
        
        if(subpath.indexOf('/lego_modules')!==-1){        

            match = subpath.match(reg);
            if(match){
                
                var content = file.getContent();
                var packageJson = JSON.parse(content);
                var mainFile = packageJson.lego.main || 'index.js';

                var moduleName = match[1];
                var version = match[2];

                result[moduleName] = subpath.replace('package.json', mainFile)
                                            .replace(version, dependencies[moduleName] || version)
                                            .replace('.js', '')
                                            .replace(/^\//, '');
            }
        }

        if(subpath.indexOf('/modules')!==-1){

            reg = /modules\/(.*)\/\1\.js/;            
            match = subpath.match(reg);

            if(match){                        

                var moduleName = match[1];

                result[moduleName] = subpath.replace('.js', '')
                                            .replace(/^\//, '');
            }
        }
    });
    return result;
}

// 配置
fis.config.merge({
	project: {
		exclude: ['tests/**']
	},
	roadmap: {		
		path: [
            {
                reg: /^\/(modules\/.*)\.js$/i,
                isMod : true,
                id : '$1',
                release : '$&'
            },	
            {
                reg: /^\/(lego_modules\/.*)\.js$/i,
                isMod : true,
                id : '$1',
                release : '$&'
            },
            {
                reg: '**/*.html',
                useCache: false,
                release: '$&'
            }
		]
	},
	modules: {       
        preprocessor: {
            html: [
                'components',
                // require('./plugins/preprocessor-jswrapper'),
            ],
            js:[
                'components',
                require('./plugins/postprocessor-lego-require'),
            ]
        },      
		postprocessor: {
			js: [
                require('./plugins/postprocessor-jswrapper'),
                // require('./plugins/postprocessor-lego-require'),
                'require-async'
            ],
            html: ['require-async']
		},
        postpackager: function(ret, conf, settings, opt){                
            
            var alias = {};
            var _alias = getAlias(ret, conf, settings, opt);
            var moduleAlias = {};
            var legoAlias = {};
            var projectPath = fis.project.getProjectPath();
            var subpath = '';

            fis.util.map(ret.src, function (subpath, file) {                
                
                if(file.isJsLike && file.isMod){

                    if(subpath.match(/^\/modules\//)){
                        moduleAlias[file.id] = {
                            subpath: subpath,
                            // url: file.url,
                            url: file.getUrl(opt.hash, opt.domain),
                            deps: file.requires
                        }; 
                    }

                    if(subpath.match(/^\/lego_modules\//)){
                        legoAlias[file.id] = {
                            subpath: subpath,
                            // url: file.url,
                            url: file.getUrl(opt.hash, opt.domain),
                            deps: file.requires
                        }; 
                    }


                }
            });

            alias = fis.util.merge(legoAlias, moduleAlias);  

            // 打包配置
            var pkgMap = {};
            fis.util.map(ret.map.pkg, function(pkgName, pkg){
                
                fis.util.map(pkg.has, function(index, moduleId){
                    if(alias[moduleId]){
                        alias[moduleId].pkg = pkgName;
                    }
                });
                pkgMap[pkgName] = {
                    url: pkg.uri
                };
            });


            var stringifiedMap = JSON.stringify({
                res: alias,
                pkg: pkgMap
            });

            // TODO 页面级别的 sourceMap，减少文件大小
            fis.util.map(ret.src, function(subpath, file){
                // HTML页面里，async 
                if(file.isHtmlLike && 
                    file.extras && 
                    file.extras.async && 
                    file.extras.async.length){

                    var content = file.getContent();
                    var script = "<script>\
                                    require.resourceMap("+ beautify(stringifiedMap, { indent_size: 2 }) +");\
                                    require._alias("+ beautify(JSON.stringify(_alias), { indent_size: 2 }) +");\
                                </script>$&";
                    file.setContent(content.replace(/<\/head>/, script));
                }
            });
        }
	},
	settings: {
		postprocessor : {
            jswrapper : {
            	type: 'amd',
            	wrapAll: false
            }
        }
	}
});