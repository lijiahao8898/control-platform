/**
 * gulpfile
 * q: scss编译成css在引用
 */
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    inject = require('gulp-inject'),
    fileinclude = require('gulp-file-include'),
    clean = require('gulp-clean'),
    htmlmin = require('gulp-htmlmin'),
    cssmin = require('gulp-cssmin'),
    rev = require('gulp-rev-hash'),
    path = require('path'),
    browserSync = require('browser-sync').create();

var DEST;
var ROOT_PATH = path.resolve(__dirname);
var HTML_PATH = path.resolve(ROOT_PATH, 'view/*.html');

console.log(ROOT_PATH);

// 开发环境目录
gulp.task('build', function () {
    DEST = 'build/';
});
// 生产环境目录
gulp.task('html', function () {
    DEST = 'html/';
});

/**
 * clean
 * 清除文件.文件夹
 */
gulp.task('clean', function () {
    return gulp.src(DEST)
        .pipe(clean({force: true}));
});

/**
 * hash
 * 增加hash
 */
gulp.task('hash', ['packHtml'], function () {
    return gulp.src(DEST + '/view/*.html')
        .pipe(rev({'assetsDir':'./' + DEST}))
        .pipe(gulp.dest(DEST +'/view/'));
});

/**
 * htmlmin
 * 压缩html
 */
gulp.task('htmlmin', ['hash'], function () {
    gulp.start(['cssmin']);
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        //collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        //removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        //removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        //removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src(DEST + 'view/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest(DEST + '/view'));
});

/**
 * cssmin
 * 压缩css
 */
gulp.task('cssmin', function () {
    return gulp.src([DEST + 'style/*.css', DEST + 'style/**/*.css'])
        .pipe(cssmin())
        .pipe(gulp.dest(DEST + '/style'))

});

/**
 * javascript
 * 合并公共的js
 */
gulp.task('scripts', function () {
    if (DEST.indexOf('build') != -1) {
        // build
        return gulp.src([
                './src/fn/common/smartresize.js',
                './src/fn/common/api.js',
                './src/fn/common/handle.js',
                './src/fn/common/common.js'
            ])
            .pipe(concat('common.js'))
            .pipe(gulp.dest(DEST + '/src/fn/common'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn/common'))
            .pipe(browserSync.stream());
    } else {
        // html
        return gulp.src([
                './src/fn/common/smartresize.js',
                './src/fn/common/api.js',
                './src/fn/common/handle.js',
                './src/fn/common/common.js'
            ])
            .pipe(concat('common.js'))
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn/common'))
            .pipe(browserSync.stream());
    }
});

/**
 * style
 * sass,scss
 * autoprefixer 自动处理游览器前缀
 * @param filename
 * @param options
 * @param url
 * @returns {*}
 */

//var compileCommonSASS = function (filename, options, url) {
//    return sass(url, options)
//        .pipe(autoprefixer('last 2 versions', '> 5%'))
//        .pipe(concat(filename))
//        .pipe(gulp.dest('./style/common/'))
//        .pipe(browserSync.stream());
//};
var compileCommonSASS = function (options, url) {
    if( DEST.indexOf('build') != -1 ){
        // build
        return sass(url, options)
            .pipe(autoprefixer('last 2 versions', '> 5%'))
            .pipe(gulp.dest('./style/css/'))
            .pipe(gulp.dest(DEST + '/style/css/'))
            .pipe(browserSync.stream());
    }else{
        // html
        return sass(url, options)
            .pipe(autoprefixer('last 2 versions', '> 5%'))
            .pipe(gulp.dest('./style/css/'))
            .pipe(gulp.dest(DEST + '/style/css/'))
            .pipe(browserSync.stream());
    }
};

/**
 * 编译sass
 * style有以下4种选择：
 * nested：          嵌套缩进，它是默认值
 * expanded：        每个属性占一行
 * compact：         每条样式占一行
 * compressed：      整个压缩成一行
 */
gulp.task('sass', function () {
    var url = ['./style/scss/*.{scss,sass}'];

    if (DEST.indexOf('build') != -1) {
        return compileCommonSASS({style: 'expanded'}, url);
    } else {
        //return compileCommonSASS({}, url);
        return compileCommonSASS({style: 'compressed'}, url);
    }

});

/**
 * html
 * 合并html => include
 * @param srcArr
 * @returns {*}
 */
var pickHtml = function (srcArr) {
    return gulp.src(HTML_PATH)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(inject(gulp.src(srcArr, {read: false}), {relative: true}))
        .pipe(gulp.dest(DEST + '/view'));
};

gulp.task('packHtml', ['sass', 'scripts'], function () {
    var srcArr;

    if (DEST.indexOf('build') != -1) {
        srcArr = [
            './src/plugin/bootstrap/css/bootstrap.css',
            './src/plugin/font-awesome/css/font-awesome.css',
            './src/plugin/nprogress/css/nprogress.css',
            './src/plugin/animate/css/animate.css',
            './src/plugin/daterangepicker/css/daterangepicker.css',
            './src/plugin/iCheck/skins/flat/green.css',
            './src/plugin/toastr/toastr.min.css',
            './src/plugin/selectize/selectize.bootstrap3.css',
            './src/plugin/jquery.dialog/jquery.dialog.css',
            './src/plugin/select-plugin/select-plugin.css',
            './style/css/daterangepicker.css',
            './src/plugin/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
            './style/css/custom.css',
            './src/plugin/jquery/js/jquery.js',
            './src/plugin/jquery/js/jquery.cookie.js',
            './src/plugin/jquery.form/jquery.form.js',
            './src/plugin/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
            './src/plugin/bootstrap/js/bootstrap.js',
            './src/plugin/moment/js/moment.min.js',
            './src/plugin/daterangepicker/js/daterangepicker.js',
            './src/plugin/iCheck/js/icheck.js',
            './src/plugin/nprogress/js/nprogress.js',
            './src/plugin/jquery.paginator/jqPaginator.min.js',
            './src/plugin/toastr/toastr.min.js',
            './src/plugin/validator/validator.js',
            './src/plugin/selectize/selectize.js',
            './src/plugin/underscore/underscore.js',
            './src/plugin/jquery.dialog/jquery.dialog.js',
            './src/plugin/jquery.dialog/jquery.mask.js',
            './src/plugin/uploadify/webuploader.js',
            './src/plugin/uploadify/imgUploadModal.js',
            './src/plugin/select-plugin/select-plugin.js',
            './src/fn/common/common.js'
        ];

    } else {
        srcArr = [
            './src/plugin/bootstrap/css/bootstrap.min.css',
            './src/plugin/font-awesome/css/font-awesome.min.css',
            './src/plugin/nprogress/css/nprogress.min.css',
            './src/plugin/animate/css/animate.min.css',
            './src/plugin/daterangepicker/css/daterangepicker.min.css',
            './src/plugin/iCheck/skins/flat/green.min.css',
            './src/plugin/toastr/toastr.min.css',
            './src/plugin/selectize/selectize.bootstrap3.css',
            './src/plugin/jquery.dialog/jquery.dialog.css',
            './src/plugin/select-plugin/select-plugin.css',
            './style/css/daterangepicker.css',
            './src/plugin/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
            './style/css/custom.css',
            './src/plugin/jquery/js/jquery.min.js',
            './src/plugin/jquery/js/jquery.cookie.js',
            './src/plugin/jquery.form/jquery.form.js',
            './src/plugin/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
            './src/plugin/bootstrap/js/bootstrap.min.js',
            './src/plugin/moment/js/moment.min.js',
            './src/plugin/daterangepicker/js/daterangepicker.min.js',
            './src/plugin/iCheck/js/icheck.min.js',
            './src/plugin/nprogress/js/nprogress.min.js',
            './src/plugin/jquery.paginator/jqPaginator.min.js',
            './src/plugin/toastr/toastr.min.js',
            './src/plugin/validator/validator.js',
            './src/plugin/selectize/selectize.js',
            './src/plugin/underscore/underscore.js',
            './src/plugin/jquery.dialog/jquery.dialog.js',
            './src/plugin/jquery.dialog/jquery.mask.js',
            './src/plugin/uploadify/webuploader.js',
            './src/plugin/uploadify/imgUploadModal.js',
            './src/plugin/select-plugin/select-plugin.js',
            './src/fn/common/common.js'
        ];
    }

    return pickHtml(srcArr)
});

/**
 * 静态服务器
 */
gulp.task('browser-sync', ['packHtml'], function () {
    return browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: './build/view/login.html'
    }, function () {
        console.log('============browser-sync服务启动完成!============')
    });
});

/**
 * copy
 * 复制
 */
gulp.task('copy-plugin', function () {
    return gulp.src(['./src/plugin/**'])
        .pipe(gulp.dest(DEST + '/src/plugin'))
});

gulp.task('copy-stub', function () {
    return gulp.src(['./src/stub/**'])
        .pipe(gulp.dest(DEST + '/src/stub'))
});

gulp.task('copy-js', function () {

    if (DEST.indexOf('build') != -1) {
        return gulp.src(['./src/fn/*.js', '!./src/fn/common/*.js'])
            .pipe(gulp.dest(DEST + '/src/fn'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn'))
    } else {
        return gulp.src(['./src/fn/*.js', '!./src/fn/common/*.js'])
            .pipe(uglify())
            .pipe(gulp.dest(DEST + '/src/fn'))
    }

});

gulp.task('copy-img', function () {
    if (DEST.indexOf('build') != -1) {
        return gulp.src('./style/images/*')
            .pipe(gulp.dest(DEST + '/style/images'))
    } else {
        return gulp.src('./style/images/*')
            .pipe(gulp.dest(DEST + '/style/images'))
    }
});

/**
 * watch
 */

gulp.task('watch', function () {
    // Watch .html files
    gulp.watch('view/*.html', ['packHtml'], browserSync.reload);

    // Watch .js files
    gulp.watch(['src/fn/**.js'], ['copy-js'], browserSync.reload);

    // Watch .scss files
    gulp.watch(['style/scss/*.{sass,scss}'], ['sass'], browserSync.reload);
    // Watch .js files
    //gulp.watch('src/js/*.js', ['scripts']);
    // Watch .scss files
    //gulp.watch('src/scss/*.scss', ['sass']);
});

// Dev Task
// 开发环境
gulp.task('dev', ['build', 'clean'], function () {
    gulp.start(['copy-plugin','copy-stub', 'copy-js', 'copy-img', 'browser-sync', 'watch']);
    console.log('============dev OK version!============')
});

// Rc Task
// 生产环境
gulp.task('rc', ['html', 'clean'], function () {
    gulp.start(['copy-plugin', 'copy-stub', 'copy-js', 'copy-img', 'packHtml', 'hash']);
    console.log('============rc OK version!============')
});