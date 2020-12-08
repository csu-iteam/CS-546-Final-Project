let hotelApiOptions = {
    method: 'GET',
    url: 'https://hotels4.p.rapidapi.com/locations/search',
    headers: {
        'x-rapidapi-key': 'b2e977b2e9msh77b94e0ede0d61dp101aa8jsn3a7448b904a0',
        'x-rapidapi-host': 'hotels4.p.rapidapi.com'
    }
};

module.exports = {
    hotel: hotelApiOptions
}