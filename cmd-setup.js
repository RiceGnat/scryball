const commands = require('./discord/api/commands');

commands.register({
    name: 'card',
    type: 1,
    description: 'Look up a card by name',
    options: [
        {
            name: 'name',
            description: 'The whole or partial name of the card',
            type: 3,
            required: true,
            autocomplete: true
        }
    ]
});

console.log('Commands registered');