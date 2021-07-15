/* eslint-disable curly */
/* eslint-disable no-case-declarations */
const Discord = require('discord.js');
const client = new Discord.Client({ disableMentions: 'everyone' });
const config = require('./config.json');
client.commands = new Discord.Collection();

const fs = require('fs');
const match = require('./game');
match.client = client;

require('dotenv').config();

client.on('ready', () => {
	console.log(client.user.username + ' is ready!');
});

client.on('message', (message) => {
	if (match.active) {
		if (message.author.bot) return;
		if (message.channel.id === match.channel.id) {
			if (
				match.currentAnswers.some((answer) =>
					message.content.toLowerCase().includes(answer.toLowerCase())
				)
			) {
				message.channel
					.send(config.strings.correct.replace('{{user}}', `<@${message.author.id}>`))
					.then(() => {
						if (match.asked.includes(match.id)) return;
						match.asked.push(match.id);

						if (config.lock.lock_channel) {
							const role =
								config.lock.locked_role === 'everyone'
									? message.guild.roles.everyone
									: message.guild.roles.cache.get(config.lock.locked_role);

							message.channel.createOverwrite(role, { SEND_MESSAGES: false });
						}
						switch (match.results.some((result) => result.id === message.author.id) > 0) {
							case true:
								const user = match.results.find(
									(result) => result.id === message.author.id
								);
								user.won++;
								break;

							case false:
								match.results.push({
									id: message.author.id,
									won: 1
								});
								break;
						}
						match.setQuestion();
						switch (match.asked.length) {
							case match.questions.length:
								if (config.lock.lock_channel) {
									const role =
										config.lock.locked_role === 'everyone'
											? message.guild.roles.everyone
											: message.guild.roles.cache.get(config.lock.locked_role);

									message.channel.createOverwrite(role, { SEND_MESSAGES: null });
								}
								const board = match.getBoard();
								message.channel.send(
									'**LEADERBOARD**\n' +
										// eslint-disable-next-line prettier/prettier
									board.slice(0, 10).map((u) => `${client.users.cache.get(u.id).tag}: ${u.won}`).join('\n')
								);
								match.end();
								break;

							default:
								setTimeout(() => {
									if (config.lock.lock_channel) {
										const role =
											config.lock.locked_role === 'everyone'
												? message.guild.roles.everyone
												: message.guild.roles.cache.get(config.lock.locked_role);

										message.channel.createOverwrite(role, { SEND_MESSAGES: null });
									}
									if (!match.active) return;
									message.channel.send(match.currentQuestion);
									match.set_timeout();
								}, config.time_between_questions);
								break;
						}
					});
			}
		}
	}

	const prefix = config.prefix;
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
