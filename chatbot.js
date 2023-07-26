const tmi = require('tmi.js');
require('dotenv').config()

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

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(channel, tags, msg, self) {

  //Ignores messages from the bot itself or messages that do not start with !
  if (self || !message.startsWith('!')) {
    return;
  }

  //Parse the command into an array with arguments
  const args = message.trim().slice(1).split(' ');
  const command = args.shift().toLowerCase();

  console.log(tags);
  console.log(`* User ${tags.username} executed !${command} command`);

  //Commands
  if (command === 'echo') {
    if (tags.moderator)
      client.say(channel, `@${tags.username}, you said: "!${args.join(' ')}"`);
  }
  else if (command === 'roll') {
    if (isNaN(parseInt(args[1])) || args[1] === undefined) {
      client.say(channel, `Specify the number of sides with !roll <number>`);
    }
    else {
      const num = Math.floor(Math.random() * parseInt(args[1])) + 1;
      client.say(channel, `@${tags.username} rolled a ${num}`);
    }
  }
  else if (command === 'flip') {
    const coin = ['heads', 'tails'];
    const num = Math.round(Math.random());
    client.say(channel, `@${tags.username} flipped a ${coin[num]}`);
  }
  else {
    console.log(`* Unknown command !${command}`);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}