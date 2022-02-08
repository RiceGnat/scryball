const axios = require('axios').default;

const host = 'https://api.scryfall.com';
const api = axios.create({ baseURL: host });

module.exports = {
    named: query => api.get(`cards/named?fuzzy=${encodeURIComponent(query)}`).then(response => response.data),
    autocomplete: query => api.get(`cards/autocomplete?q=${encodeURIComponent(query)}`).then(response => response.data)
};
