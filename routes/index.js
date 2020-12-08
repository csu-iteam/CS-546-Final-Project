const rootRoutes = require('.')
const priceRoutes = require('./priceQuery')

const constructorMethod = (app) => {
    app.use('/price', priceRoutes)

    app.use('*', (req, res) => {
        res.render('layouts/main')
    })
}
module.exports = constructorMethod