/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';
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
    var subpath = file.subpath;
    if(file.isMod){
        if(subpath.indexOf('/modules/')!=-1){

        }else if(subpath.indexOf('/modules/')!=-1){
            
        }
    }
    return content;
};

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
