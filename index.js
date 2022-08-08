const { IntentsBitField, Routes, Client, GatewayIntentBits, GatewayDispatchEvents, InteractionResponse, InteractionType, Collection } = require('discord.js'); // Base functionality of DiscordJS!
const Discord = require('discord.js');          //More DiscordJS fucntionality (whatever default export the above may have missed)
const { REST } = require('@discordjs/rest');    //Import REST functionality to query Discord servers
require('./seed/stirMessages.js');              //Import messages that L-bot will use when stirred, currently only if an ambiguous message was used
require('./seed/refuseMessages.js');            //Import messages for L-bot to refuse to do something as commanded (Currently, he just won't add L's to me, his Owner)
require('./seed/ambiguous');                    // Import explicit ambiguous messages that L-bot should ideally stir for
require('./mechanics');                         // Use to implement MongooseSchema and database connection
require('dotenv').config();                     // Used to import environment variables without compromising them/hardcoding
const fs = require('node:fs');                  // Used for digging through files/extensions
const path = require('node:path');              // Used for joining paths to other files later 
const bot_Owner_ID = process.env.ownerID;     
const client = new Client({ intents: [GatewayIntentBits.Guilds, 'GuildMessages', 'Guilds', 'GuildMembers',GatewayIntentBits.MessageContent] });     //create instance of our bot with intents listed as required by Discord API




const eventsPath = path.join(__dirname,'events');                                   //Create EventHandlers and join paths to them...
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js')); //Filter to include only JS Files
for(const file of eventFiles){                                                      //using paths, map key-value pairs from event-name to EventHandler Location
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once){
        client.once(event.name,(...args)=> event.execute(...args));
    }else{
        client.on(event.name, (...args) => event.execute(...args));
    }
}


client.commands = new Collection();                                                     //Create Collection for commands which will give us increased functionality on stored commands
const commandsPath = path.join(__dirname, 'commands');                                  // Find commands path
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')); //Filter to include only JS Files
for (const file of commandFiles){                                                       //Using paths, map key-value pairs from command-name to location
    const filePath = path.join(commandsPath,file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}


client.on('interactionCreate', async interaction => {                                   //On interaction in guild...

	const command = client.commands.get(interaction.commandName);                       //Parse command from interaction ("L.AddL..." for example) 
	if (!command) return;                                                               //if Interaction contains no command, do nothing
	try {
		await command.execute(interaction);                                             //else, execute command with given path from section above^
	} catch (error) {                                                                   //catch error, create message only interaction creator can see that there was an error
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

let currentGuildID;
client.on('ready', () => {                                                              //On bot `Ready`... 
  console.log(`Logged in as ${client.user.tag}!`);                                      //print Public-Facing username
});
client.on('guildCreate', (gData) => {                                                   //When added to a new guild...
    currentGuildID = gData.id;                                                          //store guildID in var currentGuildID
    console.log("new guild, ID: " + currentGuildID);                                    //Then print it. Currently this functionality mostly exists while I implement Database Functionality to keep track of L's.
 })

client.login(process.env.TOKEN);                                                        //Client(a.k.a. Bot) Login using Token stored in env 