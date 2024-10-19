
// TypeScript interfaces
export interface Message {
	role: 'user' | 'ai';
	content: string;
	sentiment?:
		| 'Adoration/Joy'
		| 'Amusement'
		| 'Anger'
		| 'Awe/Surprise'
		| 'Calmness'
		| 'Confusion'
		| 'Contempt/Pride'
		| 'Contentment'
		| 'Craving'
		| 'Desire/Love'
		| 'Disappointment/Shame'
		| 'Distress/Disgust'
		| 'Fear'
		| 'Interest'
		| 'Pain/Sadness'
		| 'Negative'
		| 'Neutral';
}

export interface PlantMetrics {
	timestamp: string;
	soilMoisture: number;
	waterLevel: number;
	temperature: number;
	humidity: number;
	lightIntensity: number;
	wateringEvents: number;
}