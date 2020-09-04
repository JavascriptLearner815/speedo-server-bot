const fetch = require('node-fetch');
const { stringify } = require('querystring');
const { MessageEmbed } = require('discord.js');
const trim = (str, max) => str.length > max ? `${str.slice(0, max - 3)}...` : str;;

module.exports = {
    name: 'urban',
    description: 'Get a definition from the urban dictionary.',
    aliases: ['urb', 'urb-dic', 'urban-dic', 'urb-dictionary', 'urban-dictionary'],
    args: true,
    usage: '<definition>',
    cooldown: 3,
    async execute(message, args) {
        const query = stringify({ term: args.join(' ') });

        const { list } = await fetch(`https://api.urbandictionary.com/v0/define?${query}`).then(response => response.json());

        if (!list.length) {
            const embed = new MessageEmbed()
                .setColor('#EFFF00')
                .setTitle('Not Found')
                .setDescription(`No results were found for **${args.join(' ')}**.`);

            return message.channel.send(embed);
        }

        const [ answer ] = list;

        const embed = new MessageEmbed()
            .setColor('#EFFF00');

        if (answer.word) {
            embed.setTitle(answer.word);
        }

        if (answer.permalink) {
            embed.setURL(answer.permalink);
        }

        if (answer.definition) {
            embed.addField('Definition', trim(answer.definition, 1024));
        }

        if (answer.example) {
            embed.addField('Example', trim(answer.example, 1024));
        }

        if (answer.thumbs_up && answer.thumbs_down) {
            embed.addField('Rating', `${answer.thumbs_up} upvotes. :up: ${answer.thumbs_down} downvotes. :x:`);
        } else if (answer.thumbs_up) {
            embed.addField('Rating', `${answer.thumbs_up} upvotes. :up:`);
        } else if (answer.thumbs_down) {
            embed.addField('Rating', `${answer.thumbs_down} downvotes. :x:`);
        }

        message.channel.send(embed);
    },
};
