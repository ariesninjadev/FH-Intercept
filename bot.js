const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require("express");
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

var data = [];

function generateJsText(data) {
    return `{"data":${JSON.stringify(data)}}`;
}

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

// Configuration
const CHANNEL_ID = '1312924824393355274'; // Replace with your channel ID
const OUTPUT_FILE = 'data.json';            // File to save messages
const CERT_FILE = 'certificate.crt';      // Path to your certificate file
const KEY_FILE = 'private.key';           // Path to your private key file

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Message event listener
client.on('messageCreate', (message) => {
    // Check if the message is in the target channel
    console.log(message.channel.id);
    if (message.channel.id === CHANNEL_ID) {
        let logMessage = "";

        // Check if the message contains embeds
        if (message.embeds.length > 0) {
            message.embeds.forEach((embed) => {
                // Check if the embed is rich type
                //if (embed.type === 'rich') {
                    // Add the embed to the data array
                    data.push(embed);
                    if (data.length > 20) {
                        data.shift();
                    }
                    logMessage = generateJsText(data);
                //}
            });
        }

        // Append the message to the file
        fs.writeFile(OUTPUT_FILE, logMessage, (err) => {
            if (err) {
                console.error('Error writing to file', err);
            }
        });
    }
});

// Login to Discord with your bot's token
client.login('MTMxMzIyNjU0NjA0NzIyNjAxNg.GMpvqi.zLMAx1O8yhSaOzNTLiO0TnFkpOcB2_pekE0yoo'); // Replace with your bot's token

// Express server setup
const app = express();
app.use(cors());

app.get('/data', (req, res) => {
    const dataPath = path.join(__dirname, 'data.json');
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading data.json", err);
            res.status(500).json({ error: "Failed to read data" });
            return;
        }
        res.json(JSON.parse(data));
    })
});

const options = {
    key: fs.readFileSync(KEY_FILE),
    cert: fs.readFileSync(CERT_FILE)
};

https.createServer(options, app).listen(3000, () => {
    console.log('Server is running on port 3000');
});


// Message event listener
client.on('messageCreate', (message) => {
    // Check if the message is in the target channel
    console.log(message.channel.id);
    if (message.channel.id === CHANNEL_ID) {
        let logMessage = "";
        // Add your logic to handle the message and update the data array
    }
});