// 友盟帐号 id
var AppId = {
    fkzr: {
        android: 'd989702fa5b04265d4fef925',
        ios: '8874300657b04265af381a25'
    },
    bbs: {
        android: '0a5620e165b042652349f615',
        ios: '4f1c007d65b0426570835615'
    }
};

// 保存的数据分类
var SaveMetrics = ['active_users', 'installations', 'retentions', 'launches'];

var preApi = 'http://www.umeng.com/apps/';
var API = '%s/reports/load_table_data?page=1&start_date=%s&end_date=%s&time_unit=daily&stats=%s';

var util = require('util');

var urls = [];
// 构建疯狂造人API 地址
SaveMetrics.forEach(function(one) {
    [AppId.fkzr.android, AppId.fkzr.ios].forEach(function(onee) {
        var text = util.format(API, onee, '2012-02-03', '2013-03-02', one);
        console.log(text);
        urls.push(preApi+text);
    });
});

var socket = require('socket.io-client')
io = socket.connect('http://172.16.5.98:8888/umeng');

io.on('connect', function() {
    console.log('connected');

    io.on('disconnect', function() {
        console.log('disconnected');
    });

    io.on('fetcher_log', function(data) {
        console.log(data);
    });

    io.on('got_data', function(data) {
       console.log('got data',data)
    });

    urls.forEach(function(one) {
        io.emit('need_data_request', {
            meta: 'userAttr',
            url: one,
            data: ''
        });
    });

});