/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

var findup = require('findup-sync');

module.exports = function(content, file, conf){
    // var options = file.jswrapper;

    // if(file.isMod || conf.wrapAll || options) {

    //     var template = getConfig('template', options, conf);
    //     var type = getConfig('type', options, conf);
    //     var subpath = file.subpath;

    //     // wrap
    //     if(template){
    //         content = String(template)
    //             .split('${content}').join(content)
    //             .split('${id}').join(file.getId());
    //     } else if(type === 'amd') {
    //         if(!/^\s*define\s*\(/.test(content)){
    //             content = 'define(\'' + file.getId() + '\', function(require, exports, module){ ' + content + ' \r\n});';
    //         }
    //     } else {
    //         if(!/^\s*(?:[!(]\s*|void\s+)function\(/.test(content)){
    //             content = '!function(){try{ ' + content + ' \r\n}catch(e){}}();';
    //         }
    //     }
    // }
    // return content;

    var subpath = file.subpath;

    if(file.isMod){
        
        var reg = /require\('([^'"]+)'\)/g;

        // 生态模块
        if(subpath.indexOf('lego_modules')!==-1){

            
            var packageJsonPath = findup('package.json', {cwd: file.dirname});
            var packageJson = require(packageJsonPath);
            var dependencies = packageJson.lego.dependencies;            
            var version = 0;
            var mainFile = 'index';

            content = content.replace(reg, function(matchword, modName){
                
                // if(modName.match(/^\./)){   // 内部模块
                if(modName.indexOf('lego_modules')!==-1){
                    // 备注：在 compile 模块里，类似 ./lib 这样的模块已经被转成对应的 id 了，所以也不是 ./ 开头了
                    // modName = file.subpath.replace(/^\//, '').replace(/\.js$/, '');
                }else{  // 外部模块
                    version = dependencies[modName];
                    mainFile = getMainFile(modName, version);
                    modName = 'lego_modules/' + modName + '/' + version + '/' + mainFile;
                }
                
                return 'require("'+ modName +'")'
            });

        }else if(subpath.indexOf('modules')!==-1){
            
            var packageJsonPath = findup('package.json', {cwd: file.dirname});
            var packageJson = require(packageJsonPath);
            var dependencies = packageJson.lego.dependencies;            
            var version = 0;
            var mainFile = 'index';

            content = content.replace(reg, function(matchword, modName){
                
                // if(modName.match(/^\./)){   // 内部模块
                if(modName.indexOf('module')!==-1){
                    // 备注：在 compile 模块里，类似 ./lib 这样的模块已经被转成对应的 id 了，所以也不是 ./ 开头了
                    // modName = file.subpath.replace(/^\//, '').replace(/\.js$/, '');
                }else{  // 外部模块
                    version = dependencies[modName];
                    mainFile = getMainFile(modName, version);
                    modName = 'lego_modules/' + modName + '/' + version + '/' + mainFile;
                }
                
                return 'require("'+ modName +'")'
            });
        }

        content = 'define(\'' + file.getId() + '\', function(require, exports, module){\r\n' + content + ' \r\n});';
    }
    return content;
};


function getMainFile(modName, version){
    var projectPath = fis.project.getProjectPath();    
    var packageJson = require(fis.util(projectPath, 'lego_modules/' + modName + '/' + version + '/package.json'));
    var mainFile = packageJson.lego.main;
    return mainFile ? mainFile.replace('.js', '') : 'index';
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


function getConfig(key, local, global) {
    return local && typeof local[key] !== 'undefined' ? local[key] : global[key];
}
