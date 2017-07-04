var args = require('yargs').argv;
var del = require('del');
var gulp = require('gulp');
var config = require('./gulp.config')();
var port = process.env.port || config.defaultPort;
var browserSync = require('browser-sync');


var $ = require('gulp-load-plugins')({lazy:true});

gulp.task('preinstall', function(done){
    $.shell.task(['bower install']);
});

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

gulp.task('inject', ['wiredep', 'styles'] , function(){
    log('wire up the app css into the html, and call wiredep');    

    return gulp.src(config.index)    
    .pipe($.inject(gulp.src(config.css)))
    .pipe(gulp.dest(config.client));
});

gulp.task('wiredep', function(){
    log('wire up the bower css and our app js into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp.src(config.index)
    .pipe(wiredep(options))
    .pipe($.inject(gulp.src(config.js)))
    .pipe(gulp.dest(config.client));
});

gulp.task('serve-dev', ['inject'], function(){
    var isDev = true;

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server] // TODO define the files to restart on
    }

    return $.nodemon(nodeOptions)
    .on('restart', function(ev){
        log('*** nodemon restarted');
        log('logfiles changed on restart:\n' + ev);
        setTimeout(function(){
            browserSync.notify('reloading now...');
            browserSync.reload({stream:false});
        }, config.browserReloadDelay);
    })
    .on('start', ['vet'], function(){
        log('*** nodemon started');
        startBrowserSync();
    })
    .on('crash', function(){
        log('*** nodemon died');
    })
    .on('exit', function(){
        log('*** nodemon ended');
    });    
});

////////////////////////////

function changeEvent(event){
    var srcPattern = new RegExp('/,*(?=/' + config.source + ')/');
    log('File' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(){
    if(browserSync.active){
        return;
    }

    gulp.watch([config.less], ['styles'])
    .on('change', function(event){
        changeEvent(event);
    });

    var options = {
        proxy: 'localhost:' + port,
        files:[
        config.client +  '**/*.*',
        '!' + config.less,        
        config.temp + '**/*.css'
        ],
        port: 3000,
        ghostMode:{
            clicks:true,
            location:false,
            forms:true,
            scroll:true
        },
        injectChanges:true,
        logFileChanges:true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true
    };

    log('Starting browser-sync on port ' + port);

    browserSync(options);
}

function clean(path, done) {
    log('Cleaning:' + $.util.colors.blue(path));
    del(path).then(() => done());
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