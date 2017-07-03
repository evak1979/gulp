var args = require('yargs').argv;
var del = require('del');
var gulp = require('gulp');
var config = require('./gulp.config')();


var $ = require('gulp-load-plugins')({lazy:true});

gulp.task('vet', function(){
log('Analyzing source with JShint');

    return gulp.src(config.allJs)
    .pipe($.if(args.verbose, $.print()))    
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {verbose:true}))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function(){
    log('Compiling Less to CSS');

    return gulp.src(config.less)
    .pipe($.plumber())
    .pipe($.less())    
    .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function(done){
    var files = config.temp + '**/*.css';
    clean(files, done);
});

gulp.task('less-watcher', function(){
    gulp.watch([config.less], ['styles']);
});

function clean(path, done) {
    log('Cleaning:' + $.util.colors.blue(path));
    del(path).then(x => done());
}

function log(msg){
    if(typeof(msg) === 'object'){
        for(var item in msg){
            if(msg.hasOwnProperty(item)){
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    }
    else{
        $.util.log($.util.colors.blue(msg));
    }
}