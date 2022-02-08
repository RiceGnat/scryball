const api = require('.');

const appId = process.env.APPLICATION_ID;
const token = process.env.BOT_TOKEN;

const headers = {
    Authorization: `Bot ${token}`
};

module.exports = {
    register: command => api.client.post(`applications/${appId}/commands`, command, { headers })
}