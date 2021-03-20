const fs = require('fs');
module.exports = {
	name: 'top',
	aliases: ['leaderboard', 'board'],
	execute(client, message) {
		let data = fs.readFileSync('trivia/results.json', 'utf8');
		data = JSON.parse(data);
		data.sort((a, b) => {
			return b.won - a.won;
		});
		message.channel.send(
			'***LEADERBOARD***\n' +
				data.map((u) => `${client.users.cache.get(u.id).tag}: ${u.won}`)
		);
	}
};
