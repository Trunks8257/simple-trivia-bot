const match = require('../game');
module.exports = {
	name: 'stop',
	aliases: ['end'],
	execute(client, message) {
		if (message.author.id !== '461279654158925825') return;
		const board = match.getBoard();
		if (!board[0]) return;
		message.channel.send(
			board.map((u) => `${client.users.cache.get(u.id).tag}: ${u.won}`)
		);
		match.end();
	}
};
