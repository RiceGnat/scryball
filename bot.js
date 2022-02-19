require('dotenv').config();

const discord = require('./discord');
const commands = require('./bot-commands');
const devCommands = require('./dev/commands');
discord.commands = [...commands.map(c => ({ ...c, global: true })), ...devCommands.map(c => ({ ...c, global: false }))];

const start = async () => {
    await discord.connect();
    console.log('Connected to Discord gateway socket');
}

start();
