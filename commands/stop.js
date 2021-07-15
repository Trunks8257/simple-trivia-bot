const match = require('../game');
const { admins } = require('../config.json');
module.exports = {
	name: 'stop',
	aliases: ['end'],
	execute(client, message) {
		if (!admins.includes(message.author.id)) return;
		if (!match.active) return;
		const board = match.getBoard();
		if (!board[0]) return;
		message.channel.send(
			// eslint-disable-next-line prettier/prettier
			board.slice(0, 10).map((u) => `${client.users.cache.get(u.id).tag}: ${u.won}`).join('\n')
		);
		match.end();
	}
};
