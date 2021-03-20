const match = require('../game');
const { admins } = require('../config.json');
module.exports = {
	name: 'stop',
	aliases: ['end'],
	execute(client, message) {
		if (!admins.includes(message.author.id)) return;
		const board = match.getBoard();
		if (!board[0]) return;
		message.channel.send(
			board.map((u) => `${client.users.cache.get(u.id).tag}: ${u.won}`)
		);
		match.end();
	}
};
