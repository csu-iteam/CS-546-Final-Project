const rootRoutes = require('.')

const constructorMethod = (app) => {
    app.use('*', (req, res) => {
        res.render('layouts/main')
    })
}
module.exports = constructorMethod