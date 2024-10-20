'use server';

import { Groq } from 'groq-sdk';

const groqApiKey = process.env.GROQ_API_KEY;

const groq = new Groq({ apiKey: groqApiKey });

export async function getImageDescription() {
	const imageUrl = process.env.PLANT_IMAGE_URL;

	if (!imageUrl) {
		throw new Error('PLANT_IMAGE_URL is not set in the environment variables');
	}

	try {
		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: 'user',
					content:
						'You are an expert in plant biology. You are given an image of a plant and you need to describe the plant in detail. You should describe the plant in a way that is easy to understand for a layman. You should describe the plant in a way that is easy to understand for a layman. You should describe the plant in a way that is easy to understand for a layman. You should describe the plant in a way that is easy to understand for a layman. ',
				},
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: `Describe the plant condition in the image completely. Include the plant's condition analysis, scientific classification, health status, growth indicators, environment factors, lightning and temperature conditions, and any other relevant details.
							Make your response concise and to the point.`,
						},
						{
							type: 'image_url',
							image_url: {
								url: imageUrl,
							},
						},
					],
				},
			],
			model: 'llama-3.2-90b-vision-preview',
			temperature: 1,
			max_tokens: 1024,
			top_p: 1,
			stream: false,
			stop: null,
		});

		const aiResponse =
			completion.choices[0]?.message?.content ||
			"I'm sorry, I couldn't process that request.";
		return { imageUrl, description: aiResponse };
	} catch (error) {
		console.error('Error processing request:', error);
		return {
			imageUrl,
			description: "I'm sorry, there was an error processing your request.",
		};
	}
}
