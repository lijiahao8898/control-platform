# 管控平台

## 项目目录结构

```
|- src/ ---------------------------------- js 和 插件 的目录
    |- fn -------------------------------- js 的目录
       |- common ------------------------- 通用的 js
       |- *.js --------------------------- 业务相关的 js
    |- plugin ---------------------------- 插件 的目录(存放插件对应的脚本和样式)
|- style --------------------------------- 样式 的目录
    |- common ---------------------------- 通用的 scss 的样式
    |- scss ------------------------------ scss 的样式
|- view ---------------------------------- html 的文件夹
    |- common ---------------------------- html 模板
    |- *.html ---------------------------- 业务相关的 html
```

## gulpfile config 说明

## 使用

```
1. git clone <当前项目>

2. npm install / sudo npm install / cnpm install

3. 开发环境 - gulp dev

4. 生产环境 - gulp rc

// 存在 gem sass is not installed 的问题
// 解决办法:
$ sudo gem install sass

// 如果安装不成功,gem使用淘宝镜像
$ gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
$ gem sources -l
$ sudo gem install sass

// 如果使用淘宝镜像还是无法安装。可能是mac（本人mac osx系统）自带的ruby版本问题。
// 使用rvm 或者 brew 安装更新ruby（安装rvm 或者 brew 的过程可能要安装xcode）
// 在使用 sudo gem install sass 安装

```

## gulp-concat - 连接文件

## gulp-uglify - 压缩 js

## gulp-rename - 重命名

## gulp-inject - 注入公共部分的js和css

## gulp-fileinclude - 引入公共部分的html

## gulp-clean - 清除文件

## gulp-htmlmin - 压缩html

## path - node 的 path模块

## browserSync - 启动服务

## gulp-autoprefixer - 自动处理游览器前缀

#### 基本使用

```
var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('testAutoFx', function () {
    gulp.src('src/css/index.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('dist/css'));
});
```

#### 参数说明

```
● last 2 versions: 主流浏览器的最新两个版本
● last 1 Chrome versions: 谷歌浏览器的最新版本
● last 2 Explorer versions: IE的最新两个版本
● last 3 Safari versions: 苹果浏览器最新三个版本
● Firefox >= 20: 火狐浏览器的版本大于或等于20
● iOS 7: IOS7版本
● Firefox ESR: 最新ESR版本的火狐
● > 5%: 全球统计有超过5%的使用率
```

## gulp-ruby-sass 编译scss

#### 基本使用

```
var compileSASS = function (filename, options) {
  return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST+'/css'))
        .pipe(browserSync.stream());
};

gulp.task('sass-minify', function() {
    /**
     * style有以下4种选择：
     * nested：嵌套缩进，它是默认值
     * expanded：每个属性占一行
     * compact：每条样式占一行
     * compressed：整个压缩成一行
     */
    return compileSASS('custom.min.css', {style: 'compressed'});
});
```

#### 参数说明

```
 * style有以下4种选择：
     ● nested：嵌套缩进，它是默认值
     ● expanded：每个属性占一行
     ● compact：每条样式占一行
     ● compressed：整个压缩成一行
```

> 管控平台开发指南

写在前面的话: 管控使用`jquery + bootstrap + sass`开发简单易懂上手就会.

模板使用的是[点击这里](https://github.com/puikinsh/gentelella).

不懂sass的同学[点击这里](http://www.sasschina.com/guide/). 当然也可自行百度. >.< 当然你也可以直接在`scss`文件中编写`css`!

> How to develop html ?

首先`html`命名上根据功能模块来, 例如商品就以`goods`打头:`goods-list.html`.

如果不知道页面上的内容请在 `view/common/default.html` 下复制内容.然后放在自己新建的页面里面,会生成一个默认的html,再按照自己要实现的功能来写.

> How to develop scss ?

根据功能模块命名即可.

> How to develop js ?

根据功能模块命名即可.

> Introduce the plug-in

哈哈, >.< 用到的插件不详细描述了,这里只列出名称和功能,相信你一定是个大牛! 去github看看介绍,so easy!

* `animate` - css3动画
* `bootstrap` - oh ~
* `daterangepicker` - 时间和日期选择空间
* `font-awesome` - 当然是`icon`和`font`啦!
* `iCheck` - 选择插件,提供皮肤和方法
* `jquery` - oh ~
* `jquery-dialog` - 弹窗插件
* `jquery-paginator` - 翻页插件
* `moment` - 时间处理插件
* `nprogress` - 进度条插件
* `select-plugin` - 这个我就要说了, 自主研发的弹窗选择插件.
* `selectize` - 选择框插件
* `toastr` - 错误成功提示插件
* `ueditor` - 百度的富文本
* `underscore` - 模板引擎
* `uploadify` - 这个我又要说了,是基于百度的webuploader自主研发的图片选择插件
* `validator` - 表单验证插件(自己更改过了)

## 添加商品 - goods.js 说明

> 核心对象

```
/**
 * skuArr {
 *"216":{
 *  "sku_name":"体型大小",
 *  "sku_id":"216",
 *  "floor":1,
 *  "value":[{
 *      "name":"体型大小",
 *      "sku_property_tmpl_id":"216",
 *      "value":"20",
 *      "property_value_id":94685,
 *      "thumb":""
 *      },
 *      {
 *      "name":"体型大小",
 *      "sku_property_tmpl_id":"216",
 *      "value":"30",
 *      "property_value_id":94686},
 *      "thumb":""
 *    ]}
 * }
 */
```

#### 未完待续...



