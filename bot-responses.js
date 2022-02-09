const discord = require('./discord/api');

const emojis = {};

const cardFrameColor = colors => {
    if (colors) {
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
}

const message = (content, embeds) => ({
    type: 4,
    data: {
        content, embeds
    }
});

const cardEmbeds = card => {
    switch (card.layout) {
        case 'transform':
        case 'modal_dfc':
        case 'reversible_card':
            return card.card_faces.map((face, i) => ({
                title: card.name,
                url: card.scryfall_uri,
                color: cardFrameColor(face.colors),
                image: { url: face.image_uris.png }
            }));
        default:
            return [{
                title: card.name,
                url: card.scryfall_uri,
                color: cardFrameColor(card.colors),
                image: { url: card.image_uris.png }
            }];
    }
};

const parseSymbols = text => (text || '').replace(/\{(.+?)\}/g, (match, p1) => {
    const symbol = p1.replace(/\//g, '').toLowerCase();
    return emojis[symbol] || match;
});

const oracleText = card => `**${card.type_line}**\n${parseSymbols(card.oracle_text).replace(/\(.+?\)/g, '*$&*')}${(card.power !== undefined ? `\n**${`${card.power}/${card.toughness}`.replace(/\*/g, '⋆')}**` : '')}`;

const trimTitle = text => {
    if (text.length > 256) {
        let trunc = text.substring(0, 253);
        const end = trunc.lastIndexOf('>');
        if (end > 0) trunc = trunc.substring(0, end + 1);
        return `${trunc}...`;
    }
    else return text;
}

const oracleEmbeds = card => {
    switch (card.layout) {
        case 'flip':
        case 'split':
            return [{
                title: `${card.name}`,
                url: card.scryfall_uri,
                color: cardFrameColor(card.colors),
                thumbnail: { url: card.image_uris.png },
                fields: card.card_faces.map(face => ({
                    name: `${face.name} ${parseSymbols(face.mana_cost)}`,
                    value: oracleText(face),
                    inline: true
                }))
            }];
        case 'transform':
        case 'modal_dfc':
        case 'reversible_card':
            return card.card_faces.map((face, i) => ({
                title: `${face.name} ${parseSymbols(face.mana_cost)}`,
                url: i === 0 ? card.scryfall_uri : null,
                description: oracleText(face),
                color: cardFrameColor(face.colors),
                thumbnail: { url: face.image_uris.png }
            }));
        default:
            return [{
                title: trimTitle(`${card.name} ${parseSymbols(card.mana_cost)}`),
                url: card.scryfall_uri,
                description: oracleText(card),
                color: cardFrameColor(card.colors),
                thumbnail: { url: card.image_uris.png }
            }];
    }
};

const loadEmoji = async () => {
    const servers = (process.env.EMOJI_SERVERS || '').split(',');

    const results = await Promise.all(servers.map(id => discord.getEmojis(id)
        .then(response => response.data,
            err => {
                console.log(`Error getting emojis from server ${id}`)
                console.log(err);
                return [];
            })
    ));

    results.flat()
        .filter(e => e.name.startsWith('mana'))
        .forEach(e => emojis[e.name.substring(4)] = `<:${e.name}:${e.id}>`);
    
    console.log(`Loaded ${Object.keys(emojis).length} emojis`);
};

loadEmoji();

module.exports = {
    message,
    autocomplete: choices => ({
        type: 8,
        data: {
            choices: choices.map(c => {
                const trunc = c.substring(0, 100);
                return { name: trunc, value: trunc.toLowerCase() };
            })
        }
    }),
    card: card => message(null, cardEmbeds(card)),
    oracle: card => message(null, oracleEmbeds(card))
};
