import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const adapter = new JSONFile(join(__dirname, 'db.json'));
const db = new Low(adapter, { tweets: [] });

await db.read();
await db.write();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/tweets', (req, res) => {
  const { tweets } = db.data;
  res.json(tweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/tweets', async (req, res) => {
  const { tweets } = db.data;
  const newTweet = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    likes: 0,
    retweets: 0,
    replies: [],
  };
  tweets.push(newTweet);
  await db.write();
  res.json(newTweet);
});

app.post('/tweets/:id/like', async (req, res) => {
    const { tweets } = db.data;
    const tweet = tweets.find((t) => t.id === req.params.id);
    if (tweet) {
        tweet.likes = tweet.likes ? tweet.likes + 1 : 1;
        await db.write();
        res.json(tweet);
    } else {
        res.status(404).send('Tweet not found');
    }
});

app.post('/tweets/:id/retweet', async (req, res) => {
    const { tweets } = db.data;
    const tweet = tweets.find((t) => t.id === req.params.id);
    if (tweet) {
        tweet.retweets = tweet.retweets ? tweet.retweets + 1 : 1;
        await db.write();
        res.json(tweet);
    } else {
        res.status(404).send('Tweet not found');
    }
});

app.post('/tweets/:id/reply', async (req, res) => {
    const { tweets } = db.data;
    const tweet = tweets.find((t) => t.id === req.params.id);
    if (tweet) {
        const reply = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
        };
        if (!tweet.replies) {
            tweet.replies = [];
        }
        tweet.replies.push(reply);
        await db.write();
        res.json(reply);
    } else {
        res.status(404).send('Tweet not found');
    }
});

app.use(express.static(join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});