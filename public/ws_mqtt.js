
var client = mqtt.connect('ws://192.168.56.103:3000/', {
    username: 'monitor',
    password: '41NI1wxl'
}); // you add a ws:// url here

var servers = {};

function updateTotal() {
    var clientTotal = 0;
    var publishTotal = 0;
    for (var sid in servers) {
        var server = servers[sid];
        clientTotal += server.clientCount;
        publishTotal += server.publishCount;
    }
    $('#client-total').text(clientTotal);
    $('#publish-total').text(publishTotal);
}

client.on('connect', function() {
    // Subscribe topics
    [
        '$SYS/+/started_at',
        '$SYS/+/uptime',
        '$SYS/+/clients/connected',
        '$SYS/+/+/publish/received'
    ].forEach(function(pattern){
        client.subscribe(pattern);
    });

    // Register message handler
    client.on("message", function(topic, payload) {
        // console.log('Topic:', topic);
        var serverID = topic.split('/')[1];
        if (!(serverID in servers)) {
            servers[serverID] = {
                clientCount: 0,
                publishCount: 0
            };
        }
        $("#server-id").text(serverID);
        if (topic.indexOf('started_at') > 0) {
            $('#started_at').text(new Date(payload.toString()).toLocaleString());
        } else if (topic.indexOf('/uptime') > 0) {
            $('#uptime').text(payload.toString());
        } else if (topic.indexOf('/clients/connected') > 0) {
            var clientCount = parseInt(payload.toString());
            servers[serverID].clientCount = clientCount;
            $('#clients').text(clientCount);
            updateTotal();
        } else if (topic.indexOf('/my/publish/received') > 0) {
            var publishCount = parseInt(payload.toString());
            servers[serverID].publishCount = publishCount;
            $('#publish').text(publishCount);
            updateTotal();
        }
    });
});
