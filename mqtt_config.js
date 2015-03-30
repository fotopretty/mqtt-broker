'use strict';

var mosca = require('mosca');
var commander = require("commander");

var users = {
    'mobile'    : 'V1QeoW1g',
    'monitor'   : '41NI1wxl',
    'publisher' : '41NI1wxl'
};

var defaults = {
    port: 1883,
    inflight: 10,
    levelupDb: './levelup-db',
    amqpHost: 'localhost',
    amqpPort: 5672,
    amqpLogin: 'guest',
    amqpPassword: 'guest',
    amqpExchange: 'mosca-ascolatore',
    httpPort: 3000,
    httpStatic: './public'
};

function parse(argv) {
    var program = new commander.Command();
    program
        .option("-p, --port <n>", "The port to listen to", parseInt)
        .option("--inflight <n>", "Max inflight messages", parseInt)
        .option("--levelup-db <directory>", "Levelup DB directory")
        .option("--amqp-host <s>", "QMAP host")
        .option("--amqp-port <n>", "QMAP port", parseInt)
        .option("--amqp-login <s>", "QMAP login")
        .option("--amqp-password <s>", "QMAP password")
        .option("--amqp-exchange <s>", "QMAP exchange name")
        .option("--http-port <n>", "Start an mqtt-over-websocket server on the specified port", parseInt)
        .option("--http-static <directory>", "Serve some static files alongside the websocket client");
    program.parse(argv);
    console.log('Args:',
                program.port,
                program.inflight,
                program.levelupDb,
                program.amqpHost, program.amqpPort,
                program.amqpLogin, program.amqpPassword,
                program.amqpExchange,
                program.httpPort, program.httpStatic);
    var cfg = {
        port         : program.port || defaults.port,
        inflight     : program.inflight || defaults.inflight,
        levelupDb    : program.levelupDb || defaults.levelupDb,
        amqpHost     : program.amqpHost || defaults.amqpHost,
        amqpPort     : program.amqpPort || defaults.amqpPort,
        amqpLogin    : program.amqpLogin || defaults.amqpLogin,
        amqpPassword : program.amqpPassword || defaults.amqpPassword,
        amqpExchange : program.amqpExchange || defaults.amqpExchange,
        httpPort     : program.httpPort || defaults.httpPort,
        httpStatic   : program.httpStatic || defaults.httpStatic
    };
    console.log('Final config:', cfg);
    console.log('----------------------------------------');

    // Backend settings
    var amqp = require('amqp');
    var ascoltatoreAmqp = {
        type: 'amqp',
        json: false,
        client: {
            host: cfg.amqpHost,
            port: cfg.amqpPort,
            login: cfg.amqpLogin,
            password: cfg.amqpPassword
        },
        exchange: cfg.amqpExchange
    };

    // Mosca settings
    var moscaSettings = {
        port: cfg.port,
        maxInflightMessages: cfg.inflight,
        backend: ascoltatoreAmqp,
        stats: true,
        persistence: {
            path: cfg.levelupDb,
            factory: mosca.persistence.LevelUp
        },
        http: {
            port: cfg.httpPort,
            bundle: true,
            'static': cfg.httpStatic
        }
    };

    return {
        users: users,
        moscaSettings: moscaSettings
    };
}

module.exports = {
    parse: parse
};
