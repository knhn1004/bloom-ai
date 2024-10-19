'use server';

import {
	createClient,
	ListenLiveClient,
	LiveTranscriptionEvent,
	LiveTranscriptionEvents,
} from '@deepgram/sdk';
import { Groq } from 'groq-sdk';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

const deepgram = createClient(deepgramApiKey);
const groq = new Groq({ apiKey: groqApiKey });

let dgConnection: ListenLiveClient | null = null;

export async function processUserInput(input: string) {
	try {
		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: 'system',
					content:
						"You are Bloom AI, an assistant specializing in plant care and mindfulness. You should respond with a short answer to the user's question in a friendly tone.",
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

export async function startTranscription() {
	try {
		dgConnection = deepgram.listen.live({ model: 'nova' });
		if (!dgConnection) {
			throw new Error('Failed to create Deepgram connection');
		}

		dgConnection.on(LiveTranscriptionEvents.Open, () => {
			console.log('Connection opened.');
		});

		dgConnection.on(
			LiveTranscriptionEvents.Transcript,
			(data: LiveTranscriptionEvent) => {
				console.log('Transcript received:', data);
				// Here you can handle the transcription results
				// For example, you might want to update the UI or send the transcription to your AI for processing
			}
		);

		return 'Transcription started';
	} catch (error) {
		console.error('Error starting transcription:', error);
		throw error;
	}
}

export async function stopTranscription() {
	if (dgConnection) {
		dgConnection.finish();
		dgConnection = null;
		console.log('Stopped live transcription');
		return 'Transcription stopped';
	}
	return 'No active transcription to stop';
}
