module.exports = function(){
    var client = './src/client/';
    var clientApp = client + 'app/';
    var temp = './.tmp/';
    var server = './src/server/';
    var config = {        
        allJs:[
        './src/**/*.js',
        './*.js'
        ],
        client: client,
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        less: [client + 'styles/styles.less'],
        server: server,
        temp: temp,

        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },
        css: temp + 'styles.css',
        defaultPort: 7203,
        nodeServer: './src/server/app.js',
        browserReloadDelay: 1000
    };

    config.getWiredepDefaultOptions = function(){
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        }

        return options;
    };

    return config;
};