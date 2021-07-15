const match = require('../game');
const { admins } = require('../config.json');
module.exports = {
	name: 'start',
	aliases: ['trivia'],
	execute(client, message) {
		if (!admins.includes(message.author.id)) return;
		if (match.active) return;
		match.start();
		match.channel = message.channel;
		match.setQuestion();
		match.set_timeout();
		message.channel.send(match.currentQuestion);
	}
};
