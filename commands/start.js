const match = require('../game');
module.exports = {
	name: 'start',
	aliases: ['trivia'],
	execute(client, message) {
		if (message.author.id !== '461279654158925825') return;
		match.start();
		match.setQuestion(message.channel);
		match.set_timeout();
		message.channel.send(match.currentQuestion);
	}
};
