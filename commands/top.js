const fs = require('fs');
module.exports = {
	name: 'top',
	aliases: ['leaderboard', 'board'],
	async execute(client, message) {
		let data = fs.readFileSync('trivia/results.json', 'utf8');
		data = JSON.parse(data);
		data.sort((a, b) => {
			return b.won - a.won;
		});
		const resultArray = await Promise.all(
			data.map(async (u) => {
				const user = await client.users.fetch(u.id);
				return `${user.username}#${user.discriminator}: ${u.won}`;
			})
		);
		message.channel.send('**LEADERBOARD**\n' + resultArray.slice(0, 10).join('\n'));
	}
};
