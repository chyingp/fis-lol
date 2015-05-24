/*
	## 假设 require('jquery')

	###  场景一：在业务模块modules下

	if(modules下有jquery){
		
		require_modules('modules/jquery');

	}else{

		if(项目根路径有package.json){
			if(有jquery && version){
				var version = #get_version();  // version 可能为 ^1.9.1 类似形式
				#require_lego_module('lego_modules/jquery/version')
			}else{
				#find_and_require_under_lego('jquery')
			}
		}else{
			#find_and_require_under_lego('jquery')
		}
	}

	function find_and_require_under_lego(){
		if(lego_modules下有jquery){
			var version = #get_latest_version();	// 拿最新
			#require_lego_module('lego_modules/jquery/version');
		}else{
			// 报错！
		}
	}

	### 场景2 在生态模块 lego_modules 下

	if(没有package.json || 没有jquery || 没有version){
		// 报错，找不到
	}else{
		var version = #get_version('jquery');
		#require_lego_modules('jquery');
	}

	## define(name, callback)

	modules/header

		define('modules/header')

	lego_modules/header

		define('lego_modules/header/1.0.0')
		definde('lego_modules/jquery/1.9.1')
		definde('lego_modules/jquery/2.0.0')

	## something changed

	modules
		require('mod/jquery'); // 外部 --> 根据 resourceMap
		require('modules/header/lib');  // 内部

	lego_modules
		require('lego_modules/jquery/1.9.1');  // 根据 package.json 
		require('lego_modules/header/1.0.0/lib');  // 内部

	
	resourceMap 生成

	## work

	1. modules、lego_modules 下的模块包装成 define -- ok
	2. lego_modules 里 require 替换 -- ok
		1. 外部模块替换成类似 require('lego_modules/jquery/1.9.1')
		2. 内部模块替换成类似 require('lego_modules/header/lib')
	3. modules 里 require 替换
		1. 外部模块替换成类似 
			1. modules里有，require('modules/jquery/jquery')
			1. modules里没有，require('lego_modules/jquery/1.9.1')
		2. 内部模块替换成类似 require('modules/footer/lib')

	编译watch阶段，是否需要考虑下面情况：
	1. 修改了根路径下的 package.json？比如 jquery 的版本变了 -- 建议不管
	2. 修改 模块/package.json ，模块内部的 require(xx) 需不需要变化？-- 建议不管
	3. 删除某个模块，比如 modules/footer ，而 modules/footer 被其他模块引用？-- 建议错误提示
	4. 原本 jQuery有1.9.1、2.0.0（被lego_modules 其他模块依赖的），modules/header 里 require('jquery') --> 2.0.0 （package.json里没有显示声明，用最新版本），突然删掉了 2.0.0 -- 如果package.json里没有，require了，以后也是有可能出错的
	5. 


	modules/jquery/jquery.js 
	lego_modules/jquery/1.9.1/jquery.js
	lego_modules/jquery/2.0.0/jquery.js

	思路一：
	1、扫描 ret.src，生成资源映射表map，lego_modules + modules
	2、文件变化，重新生成map
	3、对比差异

	思路二：
	1、lego_modules/header/1.0.0/header.js --> jquery 替换成实际id，如 require('lego_modules/jquery/1.9.1/jquery')
	2、modules/header/header.js --> jquery 替换成 jQuery，如 require('jquery')

	例子：
	上面提到的，实际jQuery都是同一个，也就是得有一个alias的过程 jQuery --> lego_modules/jquery/1.9.1/jqeury.js
	sourceMap --> 


	## 检查项
	1. 支持hash、domain -- ok
	2. 支持alias
	3. 支持require 模块里的单个文件
	4. require 的部分资源用线上现有的 CDN 
	
 */