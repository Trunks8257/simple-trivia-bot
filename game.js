const fs = require('fs');
const config = require('./config.json');
class game {
	constructor(questions) {
		this.questions = questions;
		this.currentQuestion = this.currentAnswers = this.id = this.timeout = this.channel = null;
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
		if (!randomQuestion) return null;
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
			this.setQuestion();
			this.channel.send(this.currentQuestion);
		}, config.time_to_answer);
	}

	start() {
		this.active = true;
	}

	end() {
		this.active = false;
		this.asked = [];
		if (!match.results[0]) return;
		let data = fs.readFileSync('trivia/results.json', 'utf8');
		data = JSON.parse(data);

		const array = [];
		for (let index = 0; index < match.results.length; index++) {
			const newUserData = match.results[index];
			const userData = data.find((u) => u.id === newUserData.id) || {
				id: newUserData.id,
				won: 0
			};
			array.push({ id: userData.id, won: userData.won + newUserData.won });
		}
		fs.writeFileSync('trivia/results.json', JSON.stringify(array), function (err) {
			if (err) return console.log(err);
		});
		this.results = [];
		setTimeout(() => {
			clearTimeout(this.timeout);
		}, config.time_to_answer / 3);
	}

	getBoard() {
		match.results.sort((a, b) => {
			return b.won - a.won;
		});
		return match.results;
	}
}
const match = new game(require('./trivia/quiz.json'));
module.exports = match;
