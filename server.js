const http = require('http');
const https = require('https');
const fs = require("fs");
const process = require('process');
const Discord = require('discord.js');
const client = new Discord.Client();

const argopts = JSON.parse(fs.readFileSync("options.json", "utf8"));
const options = {
    hostname: argopts.apioptions.domain,
    port: 443,
    path: argopts.apioptions.path + argopts.apioptions.ip,
    method: 'GET'
};

process.on('beforeExit', (code) => {
    logAndDiscord('Bot shutdown with Code: ', code);
});

process.on('SIGTERM', () => {
    logAndDiscord('Bot shutdown because of OS (SIGTERM)');
    setTimeout(() => {
        process.exit()
    }, 100);
});
process.on('SIGINT', function() {
    logAndDiscord('Bot shutdown because of UserInput (SIGINT)');
    setTimeout(() => {
        process.exit()
    }, 100);
});

client.once('ready', () => {
    logAndDiscord('Discord Bot up and running!');
    client.channels.fetch(argopts.discordoptions.iptextid)
        .then(channel => {
            channel.setName(argopts.discordchannelnames.iptextname + argopts.apioptions.ip);
        });
    logAndDiscord("Updated Server Ip to: " + argopts.apioptions.ip);

});

client.login(argopts.discordoptions.bottoken);

function logAndDiscord(text) {
    client.login(argopts.discordoptions.bottoken);
    client.channels.fetch(argopts.discordoptions.outputtextid)
        .then(channel => {
            channel.send(text);
        });
    console.log(text);
}

updateServerStatus = () => {
    let output = "";

    const req = https.request(options, res => {

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
                logAndDiscord("Updated Server Status to: online");

                client.channels.fetch(argopts.discordoptions.onlinetextid)
                    .then(channel => {
                        channel.setName(argopts.discordchannelnames.onlinetextname + output.players.online);
                    });
                logAndDiscord("updated Online Players to: " + output.players.online);
            } else {
                client.channels.fetch(argopts.discordoptions.statustextid)
                    .then(channel => {
                        channel.setName(argopts.discordchannelnames.statustextname.offline);
                    });
                logAndDiscord("Updated Server Status to: offline");

                client.channels.fetch(argopts.discordoptions.onlinetextid)
                    .then(channel => {
                        channel.setName(argopts.discordchannelnames.onlinetextname + "0");
                    });
                logAndDiscord("updated Online Players to: " + "0");
            }
        });
    });
    req.on('error', error => {
        console.error(error)
    });

    req.end();
}
setTimeout(updateServerStatus, 2500);
setInterval(updateServerStatus, 600000);