const { REST } = require('@discordjs/rest');
const { Routes, Collection } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(token);

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(process.env.clientId, process.env.KBID, 'commandId'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands
rest.delete(Routes.applicationCommand(process.env.clientId, 'commandId'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);