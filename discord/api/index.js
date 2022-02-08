const axios = require('axios').default;

const version = 9;
const host = `https://discord.com/api/v${version}`;
const api = axios.create({ baseURL: host });

module.exports = {
    host,
    version,
    client: api
};
