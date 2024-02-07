const { REST, Routes, Client, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
require('dotenv').config();

// Define an array of commands to be registered with Discord API
const commands = [
    {
        name: 'chat',
        description: 'Chat with LLM',
        options: [
            {
                name: 'message',
                description: 'Message to send to LLM',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
    {
        name: 'request',
        description: 'Make a request to the LLM without context',
        options: [
            {
                name: 'message',
                description: 'Message to send to LLM',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
    {
        name: 'config',
        description: 'Configure LLM',
        options: [
            {
                name: 'message',
                description: 'Message to send to LLM',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
    {
        name: 'prompt',
        description: 'View LLM configuration',
    },
    {
        name: 'reset',
        description: 'Reset LLM context chat',
    },
    {
        name: 'help',
        description: 'Give name of commands and their description',
    },
    {
        name: 'directresponse',
        description: 'Set the bot to always respond to messages',
        options: [
            {
                name: 'value',
                description: 'Set the value of alwaysRespond',
                type: ApplicationCommandOptionType.Boolean,
                required: true,
            },
        ]
    }
  ];


// Create a REST client to interact with the Discord API
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Asynchronous function to register/update application commands
(async () => {
    try {
    console.log('Started refreshing application (/) commands.');

    // Use the REST client to update application commands
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
    console.error(error);
    }
})();