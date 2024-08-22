import process from 'node:process';
import numeral from 'numeral';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

function formatNumber(number) {
	if (number < 1_000) {
		return number;
	} else {
		return numeral(number).format('0.0a').toUpperCase();
	}
}

async function chatOpenAI(message) {
	const chatCompletion = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo',
		messages: [{ role: 'assistant', content: "You are a Twitter Assistant, you help user using a Tweet format, you can help user to create a helpful tweet, using hashtags, mentions, 140 characters, and more." }, { role: 'user', content: message }],
        max_tokens: 200,
	});
    return chatCompletion.choices[0].message.content;
}

const OpenAIUtils = {
    chat: chatOpenAI,
};

export { formatNumber, OpenAIUtils };
