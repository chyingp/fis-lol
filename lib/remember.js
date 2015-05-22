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
 */