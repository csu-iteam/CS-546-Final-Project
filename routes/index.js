const rootRoutes = require('.')
const priceRoutes = require('./priceQuery')
const login = require('./login');
const recommendPageRoutes = require('./recommendPage');

const constructorMethod = (app) => {
    app.use('/price', priceRoutes)
    app.use('/login', login);
    app.use('/recommend', recommendPageRoutes);

    app.use('*', (req, res) => {
        res.render('layouts/main')
    })
}
module.exports = constructorMethod