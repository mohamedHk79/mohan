const { Client, GatewayIntentBits, Collection, Routes, REST } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ] 
});
const rest = new REST({ version: '9' }).setToken(config.TOKEN);

client.commands = new Collection();
client.interactions = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
}

// Load interactions
const interactionFiles = fs.readdirSync('./src/interactions').filter(file => file.endsWith('.js'));
for (const file of interactionFiles) {
    const interaction = require(`./src/interactions/${file}`);
    client.interactions.set(interaction.name, interaction);
}

// Load events
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, config, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, config, ...args));
    }
}

client.once('ready', async () => {
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: client.commands.map(command => command.data.toJSON()) }
        );
        console.log(`Bot is online! ${client.user.username}`);
        console.log('Code by ART STORE');
        console.log('discord.gg/RyE5bJMSX3');

        const statusType = "dnd"; // online | dnd | idle | invisible
        client.user.setPresence({
            status: statusType,
            activities: [{
                name: "Toman Family", // Activity Name
                type: 'STREAMING', // Activity Type: 'PLAYING', 'STREAMING', 'LISTENING', 'WATCHING'
                url: "https://www.twitch.tv/wickstudio" // Stream URL
            }]
        });
        console.log(`Bot is ready! ${client.user.tag}`);
    } catch (error) {
        console.error(error);
    }
});

client.login(config.TOKEN);
