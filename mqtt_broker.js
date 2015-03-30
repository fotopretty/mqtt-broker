'use strict';

var mqtt_config = require('./mqtt_config');
var mosca = require('mosca');

var cfg = mqtt_config.parse(process.argv);
var server = new mosca.Server(cfg.moscaSettings, setup);
var users = cfg.users;
var publishCount = 0;

server.authenticate = function(client, username, password, callback) {
    if (!username || !password) {
        callback(null , false);
        return;
    }
    var authorized = username in users && password.toString() === users[username];
    console.log('authenticate:', authorized, username, password.toString());
    if (authorized) { client.user = username; }
    callback(null, authorized);
};


server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});
server.on('clientDisconnected', function(client) {
    console.log('client disconnected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
    if (packet.topic.indexOf('$SYS') > -1) {
        var topic = packet.topic;
        if (topic.indexOf('publish/received') > -1
            && topic.indexOf('load/publish/received') < 0
            && topic.indexOf('/my/') < 0) {
            server.publish({
                topic: '$SYS/'+ server.id +'/my/publish/received',
                payload: publishCount.toString()
            });
        }
    } else {
        publishCount += 1;
    }
});

// fired when the mqtt server is ready
function setup() {
    console.log('Mosca server is up and running.');
    console.log('>> Server.id = ' + server.id);
    console.log('----------------------------------------');
}
