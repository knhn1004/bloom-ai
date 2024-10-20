'use server';

import { Groq } from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY;

const groq = new Groq({ apiKey: groqApiKey });

export async function processUserInput(input: string) {
	try {
		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: 'system',
					content:
						"You are an anthropomorphic, talking representation of a plant. You should converse in a short and friendly manner, embodying the personality of a plant with sentiment based on your metrics such as soil moisture, sunlight exposure, and temperature. ",
				},
				{ role: 'user', content: input },
			],
			model: 'llama-3.1-70b-versatile',
			temperature: 0.5,
			max_tokens: 1024,
			top_p: 1,
			stream: false,
			stop: null,
		});

		const aiResponse =
			completion.choices[0]?.message?.content ||
			"I'm sorry, I couldn't process that request.";
		return { content: aiResponse, sentiment: 'positive' };
	} catch (error) {
		console.error('Error processing request:', error);
		return {
			content: "I'm sorry, there was an error processing your request.",
			sentiment: 'negative',
		};
	}
}
