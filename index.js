(function(){
    'use strict';
    let argv = require('optimist')
            .alias('u', 'uid')
            .alias('p', 'path').default('p', './backup')
            .alias('c', 'cookie')
            // .default('c', 'your Cookie')
            .argv;

    let uid = argv.uid,
        path = argv.path,
        cookie = argv.cookie;

    if(!uid){
        throw '缺少参数:uid';
    }
    if(!cookie){
        throw '缺少参数:cookie';
    }

    var request = require('request');
    var fs = require('fs');
    var downloader = require('./lib/Downloader')(uid);
    downloader.setCookie(cookie);

    downloader.dest(path);
})();
