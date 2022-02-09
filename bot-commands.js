const scryfall = require('./scryfall');
const responses = require('./bot-responses');

const options = [
    {
        name: 'name',
        description: 'The whole or partial name of the card',
        type: 3,
        required: true,
        autocomplete: true
    }
].reduce((o, e) => ({ ...o, [e.name]: e }), {});

const findCard = async (query, oracle) => {
    try {
        const card = await scryfall.named(query);
        return oracle ? responses.oracle(card) : responses.card(card);
    }
    catch (err) {
        if (err.response) {
            return responses.message(err.response.data.details);
        }
        else throw err;
    }
}

const autocompleteCard = async query => {
    try {
        const catalog = await scryfall.autocomplete(query);
        return responses.autocomplete(catalog.data);
    }
    catch (err) {
        return responses.autocomplete([]);
    }
};

module.exports = [
    {
        name: 'card',
        type: 1,
        description: 'Find a card by name',
        options: [options['name']],
        onCommand: query => findCard(query, false),
        onAutocomplete: autocompleteCard
    },
    {
        name: 'oracle',
        type: 1,
        description: 'Get a card\'s oracle text',
        options: [options['name']],
        onCommand: query => findCard(query, true),
        onAutocomplete: autocompleteCard
    }
];
