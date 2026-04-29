import express from 'express';
import multipartBody from 'multipartbody';

const app = express();

app.post('/upload', multipartBody(), (req, res) => {
  res.json(req.body);
});

app.listen(3000, () => {
  console.log('multipartbody example listening on http://localhost:3000');
});
