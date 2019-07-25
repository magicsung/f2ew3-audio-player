const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const getStat = require('util').promisify(fs.stat);
const highWaterMark = 64;

const tracks = [
  'Central_Park.mp3',
  'Ice_Cream.mp3',
  'Keys_to_the_Apocalypse.mp3',
  'Space_Hunter.mp3',
  'Spy_Suite.mp3'
];

app.use(express.static('public'));
app.use('/audio', express.static('audio'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/stream.html'));
});

app.get('/tracks', async (req, res) => {
  res.json(tracks);
});

// 基本版本
// app.get('/tracks/:trackID', async (req, res) => {  
//   if (Number(req.params.trackID) > 4 || Number(req.params.trackID) < 0) return res.send('invalid trackID');

//   const filePath = `./audio/${tracks[req.params.trackID]}`;
//   const stat = await getStat(filePath);

//   res.writeHead(200, {
//       'Content-Type': 'audio/mp3',
//       'Content-Length': stat.size
//   });

//   const stream = fs.createReadStream(filePath, { highWaterMark, autoClose: true });
//   stream.on('end', () => console.log('stream end'));
//   stream.pipe(res);
// });

// 處理 content-range
app.get('/tracks/:trackID', function (req, res) {
  if (Number(req.params.trackID) > 4 || Number(req.params.trackID) < 0) return res.send('invalid trackID');
  const filePath = `./audio/${tracks[req.params.trackID]}`;
  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(filePath, { highWaterMark, start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp3',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp3',
    }
    res.writeHead(200, head)
    fs.createReadStream(filePath).pipe(res)
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))