const axios = require('axios').default;

const discord = require('../discord/api');
const responses = require('../bot-responses');
const scryfallManamojiUrl = 'https://api.github.com/repos/scryfall/manamoji-discord/contents/';

const getManaSymbols = async () => {
    const api = axios.create({ baseURL: scryfallManamojiUrl });
    const emojis = (await api.get('emojis')).data;
    console.log(`${emojis.length} mana symbol emoji available`);
    const extras = (await api.get('extras')).data;
    console.log(`${extras.length} additional mana symbol emoji available`);

    return [...emojis, ...extras];
};

const getBase64Image = async url => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return `data:image/jpeg;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
};

const uploadEmojis = async (offset, d) => {
    try {
        const list = await getManaSymbols();
        const o = offset || 0;
        const subset = list.slice(o, o + 50);
        console.log(`Starting with offset ${o}`);

        const data = await Promise.all(subset.map(({ download_url }) => getBase64Image(download_url)));
        await Promise.all(data.map((image, i) => discord.postEmoji(d.guild_id, { name: subset[i].name.slice(0, -4), image, roles: [] })));
        console.log('Emoji uploaded successfully');

        return responses.message(`Emoji uploaded successfully`);
    }
    catch (err) {
        console.log('Error while uploading emoji');
        console.log(err);
        return responses.message('An error occurred while uploading emoji');
    }
};

module.exports = [
    {
        name: 'install',
        type: 1,
        description: 'Upload emoji to the server (requires permission)',
        options: [{
            name: 'offset',
            type: 4,
            description: 'Start from an offset',
            required: false,
        }],
        onCommand: uploadEmojis,
    }
];
