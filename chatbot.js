require('dotenv').config()
const tmi = require('tmi.js');
const axios = require('axios');

/**
 * TODO
 * - finish getFollowage() method
 * - add more commands
 * - perhaps find an emote parser??
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
function onMessageHandler(channel, tags, msg, self) {

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
      const response = await axios.get(url, { headers });
      const channelName = response.data.data[0]['broadcaster_name'];
      const followDate = new Date(response.data.data[0]['followed_at']);
      console.log(followDate);
      client.say(channel, `@${tags.username} has been following @${channelName} for ASDF`);
    }
    getFollowage(tags['user-id'], tags['room-id']);
  }
  else if (command === 'shoutout') {
    const shoutoutMsg = `BIG shoutout to ${args[0]}! They are an awesome streamer who last played . Make sure to show them some love and check out their channel at twitch.tv/${args[0]}. Go give them a follow and support their community! 🎉🎊`;
  }
  else {
    console.log(`* Unknown command !${command}`);
  }
}





// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}