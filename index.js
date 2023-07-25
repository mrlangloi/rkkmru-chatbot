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
function onMessageHandler (channel, tags, msg, self) {

  //Ignores messages from the bot itself or messages that do not start with !
  if(self || !message.startsWith('!')) {
    return;
  }
  
  //Parse the command into an array with arguments
	const args = message.trim().slice(1).split(' ');
	const command = args.shift().toLowerCase();

  console.log(`* User ${tags.username} executed !${command} command`);

  //Commands
	if(command === 'echo') {
		client.say(channel, `@${tags.username}, you said: "${args.join(' ')}"`);
	}
  else if (command === 'test') {
    const testStr = 'test msg';
    client.say(channel, `${testStr}`);
  }
  else if (command === 'd6') {
    const num = Math.floor(Math.random() * 6) + 1;;
    client.say(channel, `You rolled a ${num}`);
  } 
  else if (command === 'd20') {
    const num = Math.floor(Math.random() * 20) + 1;
    client.say(channel, `You rolled a ${num}`);
  } 
  else if (command === '') {

  }
  else {
    console.log(`* Unknown command !${command}`);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}