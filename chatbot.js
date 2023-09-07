require('dotenv').config()
const tmi = require('tmi.js');
const axios = require('axios');
const emoteParser = require("tmi-emote-parse");

/**
 * TODO
 * - add more commands
 * - implemented emote parser however it needs to be tested
 */


// Register Twitch API credentials (ClientID and OAuth Token) needed for User-ID request
emoteParser.setTwitchCredentials(`${process.env.BOT_CLIENTID}`, `${process.env.BOT_OAUTH}}`);


// Load emotes and badges for a specific channel to later parse/use
emoteParser.loadAssets("twitch");
emoteParser.loadAssets("twitchdev");


// Configuration options
// Documentation: https://github.com/tmijs/tmi.js
const opts = {
  options: {
    debug: false
  },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: `${process.env.BOT_USERNAME}`,
    password: `${process.env.BOT_OAUTH}`
  },
  channels: [`${process.env.BOT_CHANNEL}`]
  // channels: [ '#twitch', '#twitchdev' ] /* Channels to join with leading '#' */
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
client.connect().catch(console.error);


// Called every time a message comes in
async function onMessageHandler(channel, tags, msg, self) {

  // tmi emote parser
  // Replace Emotes with HTML in a given message for a specific channel
  console.log(emoteParser.replaceEmotes(msg, tags, channel, self));
  /*
    -> message: 'I can see you ariW' 
    -> output:  'I can see you <img class="message-emote" src="https://cdn.betterttv.net/emote/56fa09f18eff3b595e93ac26/3x"/>'
  */

  // Return the badges the message author uses on a specific channel
  console.log(emoteParser.getBadges(tags, channel));
  /*
    [{
      name: 'premium/1',
      info: 'Prime Gaming',
      img: 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fb98ca1933/3'
    }, ...] 
  */


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
  // Flip a coin
  else if (command === 'coinflip') {
    const coin = ['heads', 'tails'];
    const num = Math.round(Math.random());
    client.say(channel, `@${tags.username} flipped a ${coin[num]}`);
  }
  // Get a random dad joke from the icanhazdadjoke API
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
  // Generate a random response from the 8ball API
  else if (command === '8ball') {
    const get8Ball = async () => {
      const url = 'https://eightballapi.com/api';
      const response = await axios.get(url);
      client.say(channel, `${response.data.reading}`);
    }
    get8Ball();
  }
  // Get the duration of time a user has been following the channel
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
  // Shoutout a user
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
  // Timeout a user for a specified amount of time
  else if (command === 'timeout') {
    if (tags.mod || tags.username === `${process.env.BOT_CHANNEL}`) {
      const userID = await getUserID(args[0]);
      client.say(channel, `@${args[0]} has been timed out for ${args[1]} seconds`);
      client.timeout(channel, args[0], args[1]);
    }
  }
  // Ban a user
  else if (command === 'ban') {
    if (tags.mod || tags.username === `${process.env.BOT_CHANNEL}`) {
      const userID = await getUserID(args[0]);
      client.say(channel, `@${args[0]} has been banned`);
      client.ban(channel, args[0]);
    }
  }
  // Unban a user
  else if (command === 'unban') {
    if (tags.mod || tags.username === `${process.env.BOT_CHANNEL}`) {
      const userID = await getUserID(args[0]);
      client.say(channel, `@${args[0]} has been unbanned`);
      client.unban(channel, args[0]);
    }
  }
  // Clear chat
  else if (command === 'clear') {
    if (tags.mod || tags.username === `${process.env.BOT_CHANNEL}`) {
      client.clear(channel);
    }
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