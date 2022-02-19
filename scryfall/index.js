const axios = require('axios').default;

const host = 'https://api.scryfall.com';
const api = axios.create({ baseURL: host });

const getList = url => api.get(url).then(async response => response.data.has_more ? response.data.data.concat(await getList(response.data.next_page)) : response.data.data);
const handleApiError = err => {
    console.log('Scryfall API error:')
    if (err.response) {
        console.log(err.message);
        console.log(err.response.data.details);
    }
    else console.log(err);
    throw err;
}

module.exports = {
    named: query => api.get(`cards/named?fuzzy=${encodeURIComponent(query)}`).then(response => response.data, handleApiError),
    autocomplete: query => api.get(`cards/autocomplete?q=${encodeURIComponent(query)}`).then(response => response.data, handleApiError),
    printings: query => getList(`cards/search?q=!"${encodeURIComponent(query)}"+game:paper&unique=prints&order=released`).catch(handleApiError)
};
