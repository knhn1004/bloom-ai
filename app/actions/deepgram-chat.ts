'use server';

const VOICE_AI_ENDPOINT = process.env.VOICE_AI_ENDPOINT;
console.log('endpoint: ', VOICE_AI_ENDPOINT);

export async function toggleDeepgramConnection(
	action: 'start' | 'stop',
	chatId: string
) {
	try {
		if (action === 'start') {
			await fetch(`${VOICE_AI_ENDPOINT}/start?chat_id=${chatId}`, {
				method: 'POST',
			});
		} else {
			await fetch(`${VOICE_AI_ENDPOINT}/stop`, {
				method: 'POST',
			});
		}
	} catch (error) {
		console.error('Error toggling Deepgram connection: ', error);
	}
}
