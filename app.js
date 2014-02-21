/**
 * socket 服务端
 */
var express = require('express'),
    app = express(),
    fs = require('fs'),
    http = require('http');
var server = app.listen(8888);
var io = require('socket.io').listen(server);

// generate uuid
var createUUID = function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
};

var dataSocket = io
    .of('/umeng')
    .on('connection', function(socket) {

        var uuid = createUUID();
        socket.uuid = uuid;

        console.log('current socket uuid is ', socket.uuid);
        console.log('current uuid is' + uuid);
        console.log('connected to /data');

        socket.emit('hello', {
            hello: 'world'
        });

        socket.on('need_data_request', function(data) {
            data.from = uuid;
            console.log('request info', data);
            socket.broadcast.emit('get_data_request', data);
        });

        socket.on('fetcher_log', function(data) {
            console.log('采集器log', data.message);
            socket.broadcast.emit('fetcher_log', data);
        });

        // got data
        socket.on('got_data', function(data) {
            // send to the requested user
            // socket.broadcast.emit('got_data',data);
            // find the user
            var clients = io.of('/umeng').clients();
            // console.log('clients',clients);
            clients.forEach(function(client) {
                console.log('client uuid is ', client.uuid, data.from);
                if (client.uuid == data.from) {
                    // send to the client
                    client.emit('got_data', data);
                }
            });
        });
    });