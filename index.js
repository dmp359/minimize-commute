const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use('/api/distance', require('./routes/api/distance'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index', { name: 'Where To Live' })) // Example of sending static data
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
