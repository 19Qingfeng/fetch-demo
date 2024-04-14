const express = require('express');
const data = require('./data.json');
const path = require('path');

const app = express();

app.use(express.static(path.resolve(__dirname, '../public')));

app.post('/api/data', (req, res) => {
  res.json(data);
});

app.listen(3000, () => {
  console.log('start server on 3000;');
});
