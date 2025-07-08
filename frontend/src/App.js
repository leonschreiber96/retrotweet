import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://localhost:3001';

function App() {
  const [tweets, setTweets] = useState([]);
  const [tweet, setTweet] = useState('');

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    const response = await axios.get(`${API_URL}/tweets`);
    setTweets(response.data);
  };

  const createTweet = async (e) => {
    e.preventDefault();
    if (!tweet) return;
    await axios.post(`${API_URL}/tweets`, { content: tweet });
    setTweet('');
    fetchTweets();
  };

  const likeTweet = async (id) => {
    await axios.post(`${API_URL}/tweets/${id}/like`);
    fetchTweets();
  };

  const retweetTweet = async (id) => {
    await axios.post(`${API_URL}/tweets/${id}/retweet`);
    fetchTweets();
  };

  return (
    <div className="container">
      <h1 class="mt-5">#tweetmysprint</h1>
      <form onSubmit={createTweet} className="my-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="What's happening?"
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Tweet
          </button>
        </div>
      </form>
      <div className="tweets">
        {tweets.map((t) => (
          <div key={t.id} className="card my-3">
            <div className="card-body">
              <p className="card-text">{t.content}</p>
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => likeTweet(t.id)}
                >
                  Like ({t.likes})
                </button>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => retweetTweet(t.id)}
                >
                  Retweet ({t.retweets})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;