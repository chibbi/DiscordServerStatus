const http = require('http');
const https = require('https');
const fs = require("fs");
const Discord = require('discord.js');
const client = new Discord.Client();

const argopts = JSON.parse(fs.readFileSync("options.json", "utf8"));
const options = {
    hostname: argopts.apioptions.domain,
    port: 443,
    path: argopts.apioptions.path + "/" + argopts.apioptions.ip,
    method: 'GET'
};
client.once('ready', () => {
    console.log('Discord Bot up and running!');
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
});

client.login(argopts.discordoptions.bottoken);

updateServerStatus = () => {
    let output = "";

    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', data => {
            output += data.toString();
        });
        res.on('end', () => {
            client.login(argopts.discordoptions.bottoken);
            output = JSON.parse(output);
            if (output.online == true) {
                client.channels.fetch(argopts.discordoptions.statustextid)
                    .then(channel => {
                        channel.setName(argopts.discordchannelnames.statustextname.online);
                    });
                console.log("Updated Server Status to: online");

                client.channels.fetch(argopts.discordoptions.onlinetextid)
                    .then(channel => {
                        channel.setName(argopts.discordchannelnames.onlinetextname + output.players.online);
                    });
                console.log("updated Online Players to: " + output.players.online);
            } else {
                client.channels.fetch(argopts.discordoptions.statustextid)
                    .then(channel => {
                        channel.setName(argopts.discordchannelnames.statustextname.offline);
                    });
                console.log("Updated Server Status to: offline");

                client.channels.fetch(argopts.discordoptions.onlinetextid)
                    .then(channel => {
                        channel.setName(argopts.discordchannelnames.onlinetextname + "0");
                    });
                console.log("updated Online Players to: " + "0");
            }
        });
    });
    req.on('error', error => {
        console.error(error)
    });

    req.end();
}
setTimeout(updateServerStatus, 2000);
setInterval(updateServerStatus, 600000);