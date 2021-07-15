const { inspect } = require('util');
// eslint-disable-next-line no-unused-vars
const match = require('../game');
const { admins } = require('../config.json');
module.exports = {
	name: 'eval',
	execute(client, message, args) {
		if (!admins.includes(message.author.id)) return;
		function clean(text) {
			if (typeof text === 'string')
				return text
					.replace(/`/g, '`' + String.fromCharCode(8203))
					.replace(/@/g, '@' + String.fromCharCode(8203));
			else return text;
		}
		const depthTo = args.indexOf('-depth') > -1 ? args[args.indexOf('-depth') + 1] : 0;
		// eslint-disable-next-line curly
		try {
			const code =
				depthTo > 0
					? args.slice(0, args.lastIndexOf(depthTo) - 1).join(' ')
					: args.join(' ');
			let evaled = code.includes('await')
				? eval(`(async () => {${code}})()`)
				: eval(code);

			if (typeof evaled !== 'string') evaled = inspect(evaled, { depth: depthTo });

			message.channel.send(clean(evaled), { code: 'js' });
		} catch (err) {
			message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}
};
