fis-lol
===

德玛西亚万岁！基于[fis](http://fis.baidu.com/)的二次解决方案。

## 安装

```
npm install -g fis-lol
```

## 使用

跟fis的命令差不多。

```
lol releas
```

## 模块化

类似scrat，同时支持`业务模块`跟`生态模块`：

1. 业务模块：modules下的模块，模块主入口与模块名相同。比如 `/modules/app/app.js`
2. 生态模块：lego_modules下的模块，模块主入口由`main`字段声明，否则为`index.js`，比如`/lego_modules/jquery/2.0.0/jquery.js`
3. 同时存在同名的业务模块、生态模块，业务模块优先
 
### 业务模块引用

比如要引用modules下的`app`模块，只需要这样

```
require('app');
```

目录结构如下：

```
modules/
├── app
│   └── app.js
├── footer
│   ├── footer.js
│   └── lib.js
└── jquery1
    └── jquery.js
```

### 生态模块引用

比如要引用lego_modules下的`jquery`模块，只需要

```
require('jquery');
```

目录结构如下：

```
lego_modules/
├── header
│   └── 1.0.0
└── jquery
    └── 2.0.0
```
