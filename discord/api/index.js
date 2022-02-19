const axios = require('axios').default;

const version = 9;
const host = `https://discord.com/api/v${version}`;
const api = axios.create({ baseURL: host });
const appId = process.env.APPLICATION_ID;
const token = process.env.BOT_TOKEN;
const headers = {
    Authorization: `Bot ${token}`
};

const handleApiError = err => {
    console.log('Discord API error:');
    if (err.response) {
        console.log(err.message);
        console.log(JSON.stringify(err.response.data));
    }
    else console.log(err);
    throw err;
};

module.exports = {
    host,
    version,
    client: api,
    getGateway: () => api.get('gateway'),
    postInteractionResponse: (id, token, response) => api.post(`interactions/${id}/${token}/callback`, response).catch(handleApiError),
    patchOriginalInteractionResponse: (token, response) => api.patch(`webhooks/${appId}/${token}/messages/@original`, response).catch(handleApiError),
    postFollowupMessage: (token, response) => api.post(`webhooks/${appId}/${token}`, response).catch(handleApiError),
    patchFollowupMessage: (token, messageId, response) => api.patch(`webhooks/${appId}/${token}/messages/${messageId}`, response).catch(handleApiError),
    putCommands: commands => api.put(`applications/${appId}/commands`, commands, { headers }).catch(handleApiError),
    putGuildCommands: (guildId, commands) => api.put(`applications/${appId}/guilds/${guildId}/commands`, commands, { headers }).catch(handleApiError),
    getEmojis: guildId => api.get(`guilds/${guildId}/emojis`, { headers }).catch(handleApiError),
    postEmoji: (guildId, emoji) => api.post(`guilds/${guildId}/emojis`, emoji, { headers: { ...headers, 'X-Audit-Log-Reason': 'Scryball install' } }).catch(handleApiError)
};
