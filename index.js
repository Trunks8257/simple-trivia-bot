/* eslint-disable no-case-declarations */
const Discord = require('discord.js');
const client = new Discord.Client({ disableMentions: 'everyone' });
client.commands = new Discord.Collection();

const fs = require('fs');
const match = require('./game');

require('dotenv').config();

client.on('ready', () => {
	console.log(client.user.username + ' listo!');
});

client.on('message', (message) => {
	if (match.active)
		if (match.currentAnswers.includes(message.content.toLowerCase()))
			message.channel.send('correcto').then(() => {
				if (match.asked.includes(match.id)) return;
				match.asked.push(match.id);

				switch (match.results.some((result) => result.id === message.author.id) > 0) {
					case true:
						const user = match.results.find((result) => result.id === message.author.id);
						user.won++;
						break;

					case false:
						match.results.push({
							id: message.author.id,
							won: 1
						});
						break;
				}
				match.setQuestion(message.channel);
				switch (match.asked.length) {
					case match.questions.length:
						const board = match.getBoard();
						message.channel.send(
							board.map((u) => `${client.users.cache.get(u.id).tag}: ${u.won}`)
						);
						match.end();
						break;

					default:
						setTimeout(() => {
							message.channel.send(match.currentQuestion);
							match.set_timeout();
						}, 3000);
						break;
				}
			});

	const prefix = 't/';
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command =
		client.commands.get(commandName) ||
		client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;
	try {
		command.execute(client, message, args);
	} catch (error) {
		console.error(error);
	}
});

const commandFiles = fs.readdirSync('./commands/').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.login(process.env.TOKEN);
