const fs = require('fs');
const path = require('path');
const express = require("express");
const cors = require('cors');
const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

var data = [];

function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
}

function generateJsText(data) {
    return `{"data":${JSON.stringify(data)}}`;
}

function getType(d, at) {
    let desc = d[at].description;
    if (desc == "## I'm still alive!") {
        return "Running";
    } else if (desc == "### [Pests Destroyer]\nStarting killing shitters!") {
        return "Pests";
    } else if (desc == "### Macro enabled!") {
        return "Started";
    } else if (desc == "### Macro disabled!") {
        return "Stopped";
    } else if (desc == "###[Visitors Macro]") {
        return "Visitor";
    } else {
        return "Unknown";
    }
}

function format(data) {
    let intent = data.length - 1;

    while (intent >= 0) {
        if (getType(data, intent) != "Running") {
            intent--;
            continue;
        }
        for (const e of data[intent].fields) {
            if (e.name == "Total Profit") {
                return e.value;
            }
        }
        intent--;
    }
    return "Unknown";
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
client.login('SECRET_KEY'); // Replace with your bot's token

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

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

const wait = 200;

function performTask() {
    try {
        const dataPath = path.join(__dirname, OUTPUT_FILE);
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading data.json", err);
                return;
            }
            try {
                const parsedData = JSON.parse(data);
                const time = getFormattedTime();
                const formattedData = format(parsedData.data);
                axios.get(`http://localhost:3000/custom/stats/${time}/${formattedData}`)
                    .then(response => {
                        console.log('Data sent successfully:', response.data);
                        // Start a 2-second timer after the task is complete
                        setTimeout(performTask, wait);
                    })
                    .catch(error => {
                        console.error('Error sending data:', error);
                        // Start a 2-second timer after the task is complete
                        setTimeout(performTask, wait);
                    });
            } catch (jsonError) {
                console.error('Error parsing JSON data:', jsonError);
                // Wipe the JSON data file
                fs.writeFile(dataPath, '{"data":[]}', (writeErr) => {
                    if (writeErr) {
                        console.error('Error wiping JSON data:', writeErr);
                    } else {
                        console.log('JSON data wiped successfully.');
                    }
                    // Start a 2-second timer after the task is complete
                    setTimeout(performTask, wait);
                });
            }
        });
    } catch (error) {
        console.error('Error in performTask:', error);
        // Start a 2-second timer after the task is complete
        setTimeout(performTask, 600);
    }
}

// Start the first task
performTask();