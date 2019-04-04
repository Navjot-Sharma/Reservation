const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const env = require('./environments');
const reservationRouter = require('./routes/reservations');
const rowsRouter = require('./routes/rows');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods',
   'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});


app.use('/api/reservations',reservationRouter);
app.use('/api/rows',rowsRouter);



mongoose.connect(env.mongodb, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
 .then( () => console.log('Connected to mongodb...'))
 .catch( err => console.log('Connection to mongodb failed...!', err));


module.exports = app;