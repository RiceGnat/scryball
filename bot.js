require('dotenv').config();

const discord = require('./discord');
discord.commands = require('./cmd-actions');
require('./cmd-setup');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const start = async () => {
    await discord.connect();
    console.log('Connected to Discord gateway socket');

    // await sleep(1000);

    // discord.disconnect();
    // console.log('Disconnected from Discord gateway socket');
}

start();
