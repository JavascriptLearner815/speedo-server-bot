const { readdirSync } = require('fs');

const { prefix, token } = require('./config.json');

const { Client, Collection } = require('discord.js');
const client = new Client();

const cooldowns = new Collection(); // Create a collection to hold command cooldowns

client.commands = new Collection(); // Create a collection to hold all command files

const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    client.user.setActivity(`${prefix}help`, { type: 'PLAYING' });
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.webhookID || message.channel.type === 'dm') return;

    const args = message.content.slice(prefix.length).trim()
        .split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = 'you need to supply arguments.';

        if (command.usage) {
            reply = `Use it like this: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.reply(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;

            return message.channel.send(`Command on cooldown! ${timeLeft.toFixed(1)} second(s).`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error('Error executing command:', error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token);
