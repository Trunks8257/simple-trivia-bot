module.exports = {
	name: 'ping',
	execute(client, message) {
		message.channel.send('Pinging...').then((sent) => {
			sent.edit(`Pong! ${sent.createdTimestamp - message.createdTimestamp}ms`);
		});
	}
};
