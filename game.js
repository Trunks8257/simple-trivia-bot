const fs = require('fs');
const config = require('./config.json');
class game {
	constructor(questions) {
		this.questions = questions;
		this.currentQuestion = this.currentAnswers = this.id = this.timeout = this.channel = this.client = null;
		this.active = false;
		this.asked = [];
		this.results = [];
	}

	randomQuestion() {
		const noAskedQuestions = this.questions.filter(
			(question) => !this.asked.includes(question.id)
		);
		return noAskedQuestions[Math.floor(Math.random() * noAskedQuestions.length)];
	}

	setQuestion(channel) {
		const randomQuestion = this.randomQuestion();
		if (!randomQuestion) {
			if (config.lock.lock_channel) {
				const role =
					config.lock.locked_role === 'everyone'
						? this.channel.guild.roles.everyone
						: this.channel.guild.roles.cache.get(config.lock.locked_role);

				this.channel.createOverwrite(role, { SEND_MESSAGES: null });
			}
			const board = this.getBoard();
			this.channel.send(
				'**LEADERBOARD**\n' +
					// eslint-disable-next-line prettier/prettier
					board.slice(0, 10).map((u) => `${this.client.users.cache.get(u.id).tag}: ${u.won}`).join('\n')
			);
			return this.end();
		}
		this.currentQuestion = randomQuestion.question;
		this.currentAnswers = randomQuestion.answers;
		this.id = randomQuestion.id;
		this.channel = channel;
		clearTimeout(this.timeout);
	}

	set_timeout() {
		this.timeout = setTimeout(() => {
			this.asked.push(this.id);
			this.channel.send(config.strings.out_of_time);
			this.setQuestion(this.channel);
			if (!this.active) return;
			this.channel.send(this.currentQuestion);
			this.set_timeout();
		}, config.time_to_answer);
	}

	start() {
		this.active = true;
	}

	end() {
		this.active = false;
		this.asked = [];
		if (!this.results[0]) return;
		let data = fs.readFileSync('trivia/results.json', 'utf8');
		data = JSON.parse(data);

		const array = [];
		for (let index = 0; index < this.results.length; index++) {
			const newUserData = this.results[index];
			const userData = data.find((u) => u.id === newUserData.id) || {
				id: newUserData.id,
				won: 0
			};
			array.push({ id: userData.id, won: userData.won + newUserData.won });
		}
		const nonParticipated = data.filter((u) => !array.some((user) => user.id === u.id));
		nonParticipated.forEach((p) => {
			array.push(p);
		});
		fs.writeFileSync('trivia/results.json', JSON.stringify(array), function (err) {
			if (err) return console.log(err);
		});
		this.results = [];
		setTimeout(() => {
			clearTimeout(this.timeout);
		}, config.time_to_answer / 3);
	}

	getBoard() {
		this.results.sort((a, b) => {
			return b.won - a.won;
		});
		return this.results;
	}
}
const match = new game(require('./trivia/quiz.json'));
module.exports = match;
