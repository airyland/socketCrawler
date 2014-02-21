var page = require('webpage').create();
var fs = require("fs");
var config = require('./config.json');
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open('https://www.umeng.com/sso/login?service=http://www.umeng.com/apps', function(status) {
    if (status === 'success') {
        console.log('page open successfully');
        var data;
        page.evaluate(function(config) {
            setTimeout(function() {
                document.querySelector('#userId').value = config.username;
                document.querySelector('#passWord').value = config.password;
                document.querySelector('#login-submit').click();
            }, 2000);
        }, config);
    } else {
        console.log('page open failed');
    }
});

page.onUrlChanged = function(url) {
    console.log('current url is' + url);
    // 登录成功后发送ajax请求
    if (/ticket/.test(url)) {
        // 注入socket.io
        page.injectJs('./lib/socket.io.min.js');
        page.injectJs('./lib/zepto.min.js');

        page.evaluate(function() {

            var socket = io.connect('http://127.0.0.1:8888/umeng');

            socket.on('connect', function() {
                console.log('Client has connected to the server!');
            });

            // Add a disconnect listener
            socket.on('disconnect', function() {
                console.log('The client has disconnected!');
            });

            // listen on get_data_request
            socket.on('get_data_request', function(data) {
                console.log('get need data request', JSON.stringify(data));
                var url = data.url;
                console.log(url);

                socket.emit('fetcher_log', {
                    message: '采集器::收到请求 ' + url + ' 来自:' + data.from
                });

                socket.emit('fetcher_log', {
                    message: '采集器::开始处理 ' + url + ' 来自:' + data.from
                });

                $.get(data.url, function(datas) {
                    console.log('获取完成', datas)
                    socket.emit('got_data', {
                        from: data.from,
                        meta: data.meta,
                        data: datas
                    });
                });
            });
        });

    }

};