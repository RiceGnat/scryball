const axios = require('axios').default;

const version = 9;
const host = `https://discord.com/api/v${version}`;
const api = axios.create({ baseURL: host });
const appId = process.env.APPLICATION_ID;
const token = process.env.BOT_TOKEN;
const headers = {
    Authorization: `Bot ${token}`
};

module.exports = {
    host,
    version,
    client: api,
    getGateway: () => api.get('gateway'),
    postInteractionResponse: (id, token, response) => api.post(`interactions/${id}/${token}/callback`, response),
    putCommands: commands => api.put(`applications/${appId}/commands`, commands, { headers }),
    putGuildCommands: (guildId, commands) => api.put(`applications/${appId}/guilds/${guildId}/commands`, commands, { headers }),
    getEmojis: guildId => api.get(`guilds/${guildId}/emojis`, { headers }),
    postEmoji: (guildId, emoji) => api.post(`guilds/${guildId}/emojis`, emoji, { headers: { ...headers, 'X-Audit-Log-Reason': 'Scryball install' } })
};
