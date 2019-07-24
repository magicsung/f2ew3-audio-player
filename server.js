const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const getStat = require('util').promisify(fs.stat);
const highWaterMark =  64;

const tracks = [
  'Central_Park.mp3',
  'Ice_Cream.mp3',
  'Keys_to_the_Apocalypse.mp3 ',
  'Space_Hunter.mp3',
  'Spy_Suite.mp3'
];

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/stream.html'));
});

app.get('/tracks', async (req, res) => {
  res.json(tracks);
});

app.get('/tracks/:trackID', async (req, res) => {
  if (req.params.trackID > 4 || req.params.trackID < 0) return res.send('invalid trackID');

  const filePath = `./audio/${tracks[req.params.trackID]}`;
  const stat = await getStat(filePath);
  
  res.writeHead(200, {
      'Content-Type': 'audio/mp3',
      'Content-Length': stat.size
  });

  const stream = fs.createReadStream(filePath, { highWaterMark, autoClose: true });
  stream.on('end', () => console.log('stream end'));
  stream.pipe(res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))