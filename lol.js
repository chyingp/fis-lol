var fis = module.exports = require('fis');

fis.name = 'lol';
fis.require.prefixes = [ 'lol', 'fis' ];
fis.cli.info = fis.util.readJSON(__dirname + '/package.json');
fis.cli.help.commands = [ 'release', 'install', 'server', 'init' ];


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
            js:[
                'components',
                require('./plugins/postprocessor-lego-require'),
            ]
        },      
		postprocessor: {
			js: [
                require('./plugins/postprocessor-jswrapper'),
                'require-async'
            ],
            html: ['require-async']
		},
        postpackager: require('./plugins/postpackager-sourcemap')
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