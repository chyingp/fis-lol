/*
 * fis
 * http://fis.baidu.com/
 */

var beautify = require('js-beautify').js_beautify;

module.exports = function(ret, conf, settings, opt){                
            
    var alias = {};
    var _alias = getAlias(ret, conf, settings, opt);
    var moduleAlias = {};
    var legoAlias = {};
    var projectPath = fis.project.getProjectPath();
    var subpath = '';
    var paths = fis.config.get('mod.paths') || {};

    fis.util.map(ret.src, function (subpath, file) {                
        
        if(file.isJsLike && file.isMod){

            if(subpath.match(/^\/modules\//)){
                moduleAlias[file.id] = {
                    subpath: subpath,
                    url: paths[file.id] || file.getUrl(opt.hash, opt.domain),
                    deps: file.requires
                }; 
            }

            if(subpath.match(/^\/lego_modules\//)){
                legoAlias[file.id] = {
                    subpath: subpath,
                    url: paths[file.id] || file.getUrl(opt.hash, opt.domain),
                    deps: file.requires
                }; 
            }
        }
    });

    alias = fis.util.merge(legoAlias, moduleAlias);  

    // path处理
    fis.util.map(_alias, function(modName, aliasedModName){
        if(paths[modName] && alias[aliasedModName]){
            alias[aliasedModName].url = paths[modName];
        }
    });

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
};

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