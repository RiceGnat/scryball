require('dotenv').config();
const api = require('../discord/api');
const commands = require('../bot-commands');
const devCommands = require('./commands');
const guildId = process.env.DEV_SERVER;

const execute = async option => {
    let response;
    switch (option) {
        case 'register':
            response = await api.putGuildCommands(guildId, [...commands, ...devCommands]);
            console.log(`Dev commands registered: ${response.data.map(({ name }) => name).join(' ')}`);
            break;
        case 'unregister':
            response = await api.putGuildCommands(guildId, []);
            console.log(`Dev commands cleared`);
            break;
    }
}

if (!guildId) {
    console.log('No dev server set');
}
else if (process.argv.length < 3) {
    console.log('No action');
}
else {
    execute(process.argv[2].toLowerCase());
}