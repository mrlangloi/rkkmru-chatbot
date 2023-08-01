require('dotenv').config()
const tmi = require('tmi.js');
const axios = require('axios');

/**
 * TODO
 * - add more commands
 * - perhaps find an emote parser to display emotes from chat
 * onto the stream??
 */

// Configuration options
const opts = {
  identity: {
    username: `${process.env.BOT_USERNAME}`,
    password: `${process.env.BOT_OAUTH}`
  },
  channels: [
    `${process.env.BOT_CHANNEL}`
  ]
};

// Headers for GET requests to Twitch API
const headers = {
  'Client-ID': `${process.env.BOT_CLIENTID}`,
  'Authorization': `Bearer ${process.env.BOT_OAUTH}`
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
async function onMessageHandler(channel, tags, msg, self) {

  //Ignores messages from the bot itself or messages that do not start with '!'
  if (self || !msg.startsWith('!')) {
    return;
  }

  //Parse the command into an array with arguments
  const args = msg.trim().slice(1).split(' ');
  const command = args.shift().toLowerCase();

  console.log(tags['user-id']);

  console.log(`* User ${tags.username} executed !${command} command`);

  //Commands
  if (command === 'echo') {
    if (tags.mod || tags.username === `${process.env.BOT_CHANNEL}`)
      client.say(channel, `@${tags.username}, you said: "!${args.join(' ')}"`);
  }
  // Roll a dice using !d<value> (e.g. !d20)
  else if (command.slice(0, 1) === 'd' && !isNaN(parseInt(command.slice(1, command.length)))) {
    const sides = parseInt(command.slice(1, command.length))
    if (sides < 1) {
      client.say(channel, `@${tags.username}, please specify only positive values greater than 0`);
    }
    else {
      const num = Math.floor(Math.random() * sides) + 1;
      client.say(channel, `@${tags.username} rolled a ${num}`);
    }
  }
  else if (command === 'coinflip') {
    const coin = ['heads', 'tails'];
    const num = Math.round(Math.random());
    client.say(channel, `@${tags.username} flipped a ${coin[num]}`);
  }
  else if (command === 'dadjoke') {
    const getDadJoke = async () => {
      const url = 'https://icanhazdadjoke.com/';
      const response = await axios.get(url, { 
        headers: { 'Accept': 'application/json' } 
      });
      client.say(channel, `${response.data.joke} WeirdChamp`);
    }
    getDadJoke();
  }
  else if (command === '8ball') {
    const get8Ball = async () => {
      const url = 'https://eightballapi.com/api';
      const response = await axios.get(url);
      client.say(channel, `${response.data.reading}`);
    }
    get8Ball();
  }
  else if (command === 'followage') {
    const getFollowage = async (userID, channelID) => {
      const testID = 229074073;
      const url = `https://api.twitch.tv/helix/channels/followed?user_id=${userID}&broadcaster_id=${testID}`;
      const response = await axios.get(url, { headers: headers });
      const channelName = response.data.data[0]['broadcaster_name'];
      const followDate = new Date(response.data.data[0]['followed_at']);
      const currentDate = Date.now();
      const totalDays = (currentDate - followDate) / (1000 * 60 * 60 * 24);
      const years = Math.floor(totalDays / 365);
      const months = Math.floor((totalDays % 365) / 30);
      const days = Math.floor((totalDays % 365) % 30);

      client.say(channel, `@${tags.username} has been following @${channelName} for ${years} years, ${months} months, and ${days} days! POGCRAZY`);
    }
    getFollowage(tags['user-id'], tags['room-id']);
  }
  else if (command === 'so') {

    const getLastStreamed = async (displayName) => {
      const url = `https://api.twitch.tv/helix/search/channels?query=${displayName}`;
      const response = await axios.get(url, { headers: headers });
      return response.data.data[0]['game_name'];
    }

    let lastStreamed = await getLastStreamed(args[0]);
    console.log(lastStreamed);

    // Sometimes twitch API is unable to get the game
    if (lastStreamed === '') {
      lastStream = "<Twitch API is stoopid and can't get game>"
    }

    const displayShoutoutMessage = () => {
      const shoutoutMsg = `Shoutout to @${args[0]}! They last streamed ${lastStreamed}. Check out their channel at https://twitch.tv/${args[0]} 🎉🎊`;
      client.say(channel, shoutoutMsg);
    }

    setTimeout(displayShoutoutMessage, 1000);
  }
  else {
    console.log(`* Unknown command !${command}`);
  }
}

const getUserID = async (displayName) => {
  const url = `https://api.twitch.tv/helix/users?login=${displayName}`;
  const response = await axios.get(url, { headers: headers });
  console.log(response.data.data[0]);
  return response.data.data[0]['id'];
}


// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}