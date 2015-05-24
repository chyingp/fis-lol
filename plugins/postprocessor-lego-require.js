/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';

var findup = require('findup-sync');

module.exports = function(content, file, conf){

    var subpath = file.subpath;

    if(file.isMod || file.isHtmlLike){
        
        var reg = /require\('([^'"]+)'\)/g;
        // var reg = /lego_modules\/(.*)\/(.*)\/package\.json/;
        
        if(subpath.indexOf('lego_modules')!==-1){   // 生态模块，lego_modules
        // if(/lego_modules\/(.*)\/(.*)\/package\.json/.test(file.subpath)){
            
            var packageJsonPath = findup('package.json', {cwd: file.dirname});
            // var packageJsonPath = file.toString();
            var packageJson = require(packageJsonPath);
            var dependencies = packageJson.lego.dependencies;            
            var version = 0;
            var mainFile = 'index';
            var info = null;

            content = content.replace(reg, function(matchword, modName){
                
                // if(modName.match(/^\./)){   // 内部模块
                if(modName.indexOf('./')!==-1){
                    // 备注：在 compile 模块里，类似 ./lib 这样的模块已经被转成对应的 id 了，所以也不是 ./ 开头了
                    // modName = file.subpath.replace(/^\//, '').replace(/\.js$/, '');
                    // info = fis.uri.getId('\''+modName+'\'', file.dirname);
                    // modName = info.id;
                    return matchword;
                }else{  // 外部模块
                    version = dependencies[modName];
                    mainFile = getMainFile(modName, version);
                    modName = 'lego_modules/' + modName + '/' + version + '/' + mainFile;
                }
                
                return 'require(\''+ modName +'\')'
            });

        }else if(subpath.indexOf('modules')!==-1){  // 业务模块，modules 内
            
            // var packageJsonPath = findup('package.json', {cwd: file.dirname});
            // var packageJson = require(packageJsonPath);
            // var dependencies = packageJson.lego.dependencies;            
            // var version = 0;
            // var mainFile = 'index';

            // content = content.replace(reg, function(matchword, modName){
                
            //     // if(modName.match(/^\./)){   // 内部模块
            //     if(modName.indexOf('./')!==-1){
            //         // 备注：在 compile 模块里，类似 ./lib 这样的模块已经被转成对应的 id 了，所以也不是 ./ 开头了
            //         // modName = file.subpath.replace(/^\//, '').replace(/\.js$/, '');
            //     }else{  // 外部模块
            //         if(fis.util.exists('modules/' + modName)){  // 是否modules里的模块
            //             modName = 'modules/' + modName + '/index';
            //         }else{  
            //             version = dependencies[modName];
            //             mainFile = getMainFile(modName, version);
            //             modName = 'lego_modules/' + modName + '/' + version + '/' + mainFile;
            //         }                    
            //     }
                
            //     // return 'require("'+ modName +'")'
            //     return matchword;
            // });
        }else if(file.isHtmlLike){
            // 分析处理 require.async
            var packageJsonPath = findup('package.json', {cwd: file.dirname});
            var packageJson = require(packageJsonPath);
            var dependencies = packageJson.lego.dependencies;            
            var version = 0;
            var mainFile = 'index';
            var extras = [];

            // require.async(['header', 'footer'], callback)
            reg = /require\.async\((\[.*\])/g;

            content = content.replace(reg, function(matchword, modNames){            
                
                modNames = JSON.parse(modNames.replace(/'/g, '"'));
                modNames.forEach(function(modName){
                    // if(modName.match(/^\./)){   // 内部模块
                    if(modName.indexOf('./')!==-1){
                        // 备注：在 compile 模块里，类似 ./lib 这样的模块已经被转成对应的 id 了，所以也不是 ./ 开头了
                        // modName = file.subpath.replace(/^\//, '').replace(/\.js$/, '');
                    }else{  // 外部模块
                        if(fis.util.exists('modules/' + modName)){  // 是否modules里的模块
                            modName = 'modules/' + modName + '/index';
                        }else{  
                            version = dependencies[modName];
                            mainFile = getMainFile(modName, version);
                            modName = 'lego_modules/' + modName + '/' + version + '/' + mainFile;
                        }                    
                    }
                    extras.push(modName);
                });

                return 'require.async('+ JSON.stringify(extras);
            });
        }

        // if(!file.isHtmlLike){
        //     content = 'define(\'' + file.getId() + '\', function(require, exports, module){\r\n' + content + ' \r\n});';    
        // }
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
