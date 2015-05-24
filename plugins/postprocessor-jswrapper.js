/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';
module.exports = function(content, file, conf){
    var options = file.jswrapper;

    if(file.isMod || conf.wrapAll || options) {

        var template = getConfig('template', options, conf);
        var type = getConfig('type', options, conf);

        // wrap
        content = 'define(\'' + file.getId() + '\', function(require, exports, module){ ' + content + ' \r\n});';
    }
    return content;
};

function getConfig(key, local, global) {
    return local && typeof local[key] !== 'undefined' ? local[key] : global[key];
}