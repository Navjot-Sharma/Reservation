const app = require('./backend/app');

const port = process.env.PORT | 2000;

app.listen(port, err => {
  if (err) return console.log('Server crashed...', err);

  console.log(`Server listening at port ${port}...`);
});