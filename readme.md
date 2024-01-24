## Project Title: Discord LLM Bot
#### Overview

This Discord bot is designed to harness the power of local Language Model (LLM) capabilities using LM_studio server. 

#### Features

    Local LLM Integration: Utilize the local Language Model capabilities of LM_studio server.
    Discord.js: Leverage the Discord.js library for easy integration with Discord.

#### Installation

Make sure you have Node.js and npm installed on your machine.

```bash
npm install discord.js
npm install axios
npm install dotenv
```

For more detailed information on LM_studio server and its usage, refer to the official github. https://github.com/lmstudio-ai

#### Configuration

Before running the bot, make sure to configure the Discord bot token in your environment variables in the .env file.

#### Usage

Register the command by using the following command:

```bash
node src/register_commands.js
```
Start the bot using the following command:

```bash
node src/bot.js
```
#### Additional Notes

    Ensure that your Discord bot has the necessary permissions in your server.

Feel free to explore, contribute, and customize the bot according to your needs! If you encounter any issues or have suggestions, please open an issue on the GitHub repository.