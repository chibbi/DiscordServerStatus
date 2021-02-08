const https = require('https');
const fs = require("fs");

let output = "";

const argopts = JSON.parse(fs.readFileSync("options.json", "utf8"));
const options = {
    hostname: argopts.apioptions.domain,
    port: 443,
    path: argopts.apioptions.path + argopts.apioptions.ip,
    method: 'GET'
};

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', data => {
        output += data.toString();
    });
    res.on('end', () => {
        output = JSON.parse(output);
        if (output.online == true) {
            console.log("Updated Server Status to: online");
            console.log("updated Online Players to: " + output.players.online);
        } else {
            console.log("Updated Server Status to: offline");
            console.log("updated Online Players to: " + "0");
        }
    });
});
req.on('error', error => {
    console.error(error)
});

req.end();
/*
var url = 'http://myexternalip.com/raw';
http.get(url, function(r) {
    r.setEncoding('utf8');
    r.on('data', (chunk) => {
        client.channels.fetch(argopts.discordoptions.iptextid)
            .then(channel => {
                channel.setName(argopts.discordchannelnames.iptextname + chunk);
            });
        console.log("Updated Server Ip to: " + chunk);
    });
});
*/