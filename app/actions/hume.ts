'use server';

import { HumeClient } from 'hume';

const humeApiKey = process.env.HUME_API_KEY;

if (!humeApiKey) {
	throw new Error('HUME_API_KEY is not set in the environment variables');
}

const hume = new HumeClient({
	apiKey: humeApiKey,
});

export async function analyzeExpression(imageUrl: string) {
	try {
		const job = await hume.expressionMeasurement.batch.startInferenceJob({
			models: {
				face: {},
			},
			urls: [imageUrl],
		});

		console.log('Running Hume analysis...');

		await job.awaitCompletion();

		const predictions =
			await hume.expressionMeasurement.batch.getJobPredictions(job.jobId);

		return predictions;
	} catch (error) {
		console.error('Error in Hume expression analysis:', error);
		throw error;
	}
}
