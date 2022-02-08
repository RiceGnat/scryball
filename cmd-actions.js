const scryfall = require('./scryfall');

const message = (content, embeds) => ({
    type: 4,
    data: {
        content, embeds
    }
});

const autocomplete = choices => ({
    type: 8,
    data: {
        choices: choices.map(c => {
            const trunc = c.substring(0, 100);
            return { name: trunc, value: trunc.toLowerCase() };
        })
    }
});

const cardFrameColor = colors => {
    if (colors.length > 1) return 0xe7d78d;
    else if (colors.length == 1) {
        switch (colors[0]) {
            case 'W': return 0xf8f9f3;
            case 'U': return 0x0073b2;
            case 'B': return 0x060000;
            case 'R': return 0xd9242d;
            case 'G': return 0x008341;
        }
    }
}

module.exports = {
    card: async (data, options) => {
        const query = options.find(({ name }) => name === 'name').value;

        switch (data.type) {
            case 2: // APPLICATION_COMMAND
                try {
                    const card = await scryfall.named(query);
                    return message(null, [
                        {
                            title: card.name,
                            url: card.scryfall_uri,
                            color: cardFrameColor(card.colors),
                            image: { url: card.image_uris.png }
                        }
                    ]);
                }
                catch (err) {
                    return message('No card found');
                }
            case 4: // APPLICATION_COMMAND_AUTOCOMPLETE
                try {
                    const catalog = await scryfall.autocomplete(query);
                    return autocomplete(catalog.data);
                }
                catch (err) {
                    return autocomplete([]);
                }
        }
    } 
}