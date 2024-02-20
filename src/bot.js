const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Map to store recent messages for each guild
const guildMessages = new Map();
const guildDirectResponse = new Map();

// Default message to be sent to the model if no context is set
const defaultMessages = { "role": "system", "content": "You are an AI assistant, your responses should be short and precise" };

/**
 * Adds a new message to the guild's message history, maintaining a limit of 5 messages.
 * @param {string} guildId - The ID of the guild.
 * @param {Object} new_message - The new message to be added.
 * You are an AI assistant answering questions, ensure your response is short and precise
 */
function addMessage(guildId, new_message) {
  try {
    if (!guildMessages.has(guildId)) {
      guildMessages.set(guildId, []);
      guildMessages.get(guildId).push(defaultMessages);
    }

    const messages = guildMessages.get(guildId);
    messages.push(new_message);

    if (messages.length > 5) {
      messages.splice(1, messages.length - 6);
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Sets the direct response value for the guild.
 * @param {string} guildId - The ID of the guild.
 * @param {boolean} value - The value to be set.
 */
function setDirectResponse(guildId, value) {
  try {
    if (!guildDirectResponse.has(guildId)) {
      guildDirectResponse.set(guildId, []);
    }
    guildDirectResponse.set(guildId, value);
  } catch (error) {
    console.error(error);
  }
}


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Event handler when the bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', async (message) => {

  const guildId = message.guild.id;

  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.author.id === client.user.id) return;
  if (guildDirectResponse.get(guildId)) {
    try {

      const userRequest = message.content;

      if (userRequest === undefined || userRequest === null || userRequest === "") {
        return;
      }
  
      const usermessage = { "role": "user", "content": userRequest };
  
      addMessage(guildId, usermessage);
  
      const requestData = {
        model: 'local-model',
        messages: guildMessages.get(guildId),
        temperature: 0.7,
        max_tokens: 200,
      };
  
      axios
      .post(`${process.env.base_url}/chat/completions`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.api_key}`,
        },
      })
      .then((response) => {
        const ping = `<@${message.author.id}>`;
        const result = ping+" "+response.data.choices[0].message.content.substring(0, 2000 - ping.length);
        message.channel.send(result);
        addMessage(guildId, response.data.choices[0].message);
        console.log("Chat process successfully for user in guild : " + message.guild.name);
      })
      .catch((error) => {
        console.error('Error:', error.errors.code);
      });
    } catch (error) {
      console.error(error);
    }
  }


  
});


// Event handler for interactions (commands)
client.on('interactionCreate', async (interaction) => {

    if (!interaction.guild) return;
    if (!interaction.isChatInputCommand()) return;

    const guildId = interaction.guildId;

    // Handle the /chat command
    if (interaction.commandName === 'chat') {

        const userRequest = interaction.options.get('message').value;

        if (userRequest === undefined || userRequest === null || userRequest === "") {
          return;
        }  

        const message = { "role": "user", "content": userRequest };

        addMessage(guildId, message);

        const requestData = {
          model: 'local-model',
          messages: guildMessages.get(guildId),
          temperature: 0.7,
          max_tokens: 200,
        };

        interaction.deferReply();

        axios
        .post(`${process.env.base_url}/chat/completions`, requestData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.api_key}`,
          },
        })
        .then((response) => {
          const result = response.data.choices[0].message.content.substring(0, 2000);
          interaction.editReply(result);
          addMessage(guildId, response.data.choices[0].message);
          console.log("Chat process successfully for user : " + interaction.user.username + " in guild : " + interaction.guild.name);
        })
        .catch((error) => {
          console.error('Error:', error.errors.code);
          interaction.deleteReply();
        });
    }

    // Handle the /request command
    if (interaction.commandName === 'request') {

        const userRequest = interaction.options.get('message').value;

        if (userRequest === undefined || userRequest === null || userRequest === "") {
          return;
        }  

        const message = [
          { "role": "system", "content": "You are an AI assistant answering questions" },
          { "role": "user", "content": userRequest }
        ]

        const requestData = {
          model: 'local-model',
          messages: message,
          temperature: 0.5,
          max_tokens: 800,
        };

        interaction.deferReply();

        axios
        .post(`${process.env.base_url}/chat/completions`, requestData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.api_key}`,
          },
        })
        .then((response) => {
          const result = response.data.choices[0].message.content.substring(0, 2000);
          interaction.editReply(result);
          console.log("Request process successfully for user : " + interaction.user.username + " in guild : " + interaction.guild.name);
        })
        .catch((error) => {
          console.error('Error:', error.errors.code);
          interaction.deleteReply();
        });
    }
    
    // Handle the /config command
    if (interaction.commandName === 'config') {
      try {
        const userRequest = interaction.options.get('message').value;

        if (userRequest === undefined || userRequest === null || userRequest === "") {
          return;
        }  

        interaction.reply("The system prompt is currently : " + userRequest);
    
        if (!guildMessages.has(guildId)) {
            guildMessages.set(guildId, []);
        }
    
        const messages = guildMessages.get(guildId);
        
        if (messages.length > 0) {
            messages[0] = { "role": "system", "content": userRequest };
        } else {
            messages.push({ "role": "system", "content": userRequest });
        }
      } catch (error) {
        console.error(error);
      }
    }

    // Handle the /viewConfig command
    if (interaction.commandName === 'prompt') {
      try {
        if (!guildMessages.has(guildId)) {
          interaction.reply("No system prompt has been set yet");
        } else {
          interaction.reply("The system prompt is currently : " + guildMessages.get(guildId)[0].content);
        }
      } catch (error) {
        console.error('Error:', error.errors.code);
      }
    }

    // Handle the /reset command
    if (interaction.commandName === 'reset') {
      try {
        if (!guildMessages.has(guildId)) {
          interaction.reply("No context has been set yet");
        } else {
          guildMessages.set(guildId, []);
          guildMessages.get(guildId).push(defaultMessages);
          interaction.reply("The context has been reset");
        }
      } catch (error) {
        console.error('Error:', error.errors.code);
      }
    }

    // Handle the /alwaysRespond command
    if (interaction.commandName === 'directresponse') {
      try {
        const value = interaction.options.get('value').value;

        if (value === undefined || value === null || value === "") {
          return;
        }

        setDirectResponse(guildId, value);
        interaction.reply(`The bot will now always respond to messages: ${value}`);
      } catch (error) {
        console.error('Error:', error.errors.code);
      }
    }

    // Handle the /help command
    if (interaction.commandName === 'help') {
        const help = "### /chat\nEnables conversation with the model, considering prior interactions, including those from other users on the server.\n### /request\nEnables sending a query to the model without context, using only the latest information provided.\n### /config\nEnables modifying the initial system prompt.\n### /prompt\nAllows viewing the current system prompt.\n### /reset\nEnables resetting the chat context.";
        interaction.reply(help);
    }
});

// Log in with the bot's token
client.login(process.env.TOKEN);

 
