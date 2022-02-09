require('dotenv').config();

const discord = require('./discord');
const commands = require('./bot-commands');
const devCommands = require('./dev/commands');
discord.commands = [...commands.map(c => ({ ...c, global: true })), ...devCommands.map(c => ({ ...c, global: false }))];

const sleep = ms => new Promise(r => setTimeout(r, ms));

const start = async () => {
    await discord.connect();
    console.log('Connected to Discord gateway socket');

    // await sleep(1000);

    // discord.disconnect();
    // console.log('Disconnected from Discord gateway socket');
}

start();
