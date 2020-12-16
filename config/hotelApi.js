let apiKey =
    {
        'x-rapidapi-key': 'fb809eccf7mshf5ff715a5abefcbp164e50jsn2d1e18d2883b',
        'x-rapidapi-host': 'hotels4.p.rapidapi.com'
    }

let amadeusKey = {
    'apiKey': 'PovUwJikGBhouqNwJ0mVMAdYgXMOk8qg',
    'apiSecret': 'eI6KdFq90VwchZSV'
}

let locApiOptions = {
    method: 'GET',
    url: 'https://hotels4.p.rapidapi.com/locations/search',
    headers: apiKey
};

let hotelApiOptions = {
    method: 'Get',
    url: 'https://hotels4.p.rapidapi.com/properties/list',
    headers: apiKey
}

let amadeusTokenOptions = {
    method: 'POST',
    url: 'https://test.api.amadeus.com/v1/security/oauth2/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    data: `grant_type=client_credentials&client_id=${amadeusKey.apiKey}&client_secret=${amadeusKey.apiSecret}`
}

module.exports = {
    locQ: locApiOptions,
    hotQ: hotelApiOptions,
    amadeusToken: amadeusTokenOptions
}