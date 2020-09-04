const fetch = require('node-fetch');

module.exports = {
    name: 'cat',
    description: 'Display an image of a random cat.',
    aliases: ['meow'],
    cooldown: 3,
    async execute(message, args) {
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());

        return message.channel.send(file);
    },
};
