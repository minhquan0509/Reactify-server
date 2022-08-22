require('dotenv').config();
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
const lyricsFinder = require('lyrics-finder');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.post('/refresh', (req, res) =>{
    const refreshToken = req.body.refreshToken
    const spotifyWebApi = new SpotifyWebApi({
        redirectUri: process.env.REACT_APP_DEV_URL,
        clientId: process.env.REACT_APP_CLIENT_ID,
        clientSecret: process.env.REACT_APP_CLIENT_SECRET,
        refreshToken
    })

    spotifyWebApi
    .refreshAccessToken()
    .then(
        (data) => {
          res.json({
            accessToken: data.body.access_token,
            expiresIn: data.body.expires_in,
          })   
        })
    .catch((err) => {
        res.sendStatus(400)
    })      
})

app.post('/login', (req, res) =>{
    const code = req.body.code
    const spotifyWebApi = new SpotifyWebApi({
        redirectUri: process.env.REACT_APP_DEV_URL,
        clientId: process.env.REACT_APP_CLIENT_ID,
        clientSecret: process.env.REACT_APP_CLIENT_SECRET
    })

    spotifyWebApi.authorizationCodeGrant(code)
    .then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
        
    })
    .catch( (err) => {
        console.log(err);
        res.sendStatus(400)
    })
})

app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist, req.query.track) || 'No lyrics found'
    res.json({lyrics})
})

app.listen(3001);