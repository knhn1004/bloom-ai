import {
	Droplet,
	Smile,
	Meh,
	Frown,
	Laugh,
	Flame,
	Zap,
	Cloud,
	HelpCircle,
	ThumbsDown,
	Coffee,
	Utensils,
	Heart,
	CloudRain,
	Eye,
	AlertTriangle,
} from 'lucide-react';

export const getSentimentInfo = (sentiment?: string) => {
	switch (sentiment) {
		case 'positive':
		case 'joy':
		case 'adoration':
			return { icon: Smile, color: 'text-green-500', label: 'Joy/Adoration' };
		case 'amusement':
			return { icon: Laugh, color: 'text-yellow-400', label: 'Amusement' };
		case 'anger':
			return { icon: Flame, color: 'text-red-600', label: 'Anger' };
		case 'awe':
		case 'surprise':
			return { icon: Zap, color: 'text-purple-500', label: 'Awe/Surprise' };
		case 'calmness':
			return { icon: Cloud, color: 'text-blue-300', label: 'Calmness' };
		case 'confusion':
			return { icon: HelpCircle, color: 'text-gray-500', label: 'Confusion' };
		case 'contempt':
		case 'pride':
			return {
				icon: ThumbsDown,
				color: 'text-orange-500',
				label: 'Contempt/Pride',
			};
		case 'contentment':
			return { icon: Coffee, color: 'text-brown-400', label: 'Contentment' };
		case 'craving':
			return { icon: Utensils, color: 'text-pink-400', label: 'Craving' };
		case 'desire':
		case 'love':
			return { icon: Heart, color: 'text-red-400', label: 'Desire/Love' };
		case 'disappointment':
		case 'shame':
			return {
				icon: CloudRain,
				color: 'text-blue-600',
				label: 'Disappointment/Shame',
			};
		case 'distress':
		case 'disgust':
			return {
				icon: Frown,
				color: 'text-green-700',
				label: 'Distress/Disgust',
			};
		case 'fear':
			return { icon: AlertTriangle, color: 'text-yellow-600', label: 'Fear' };
		case 'interest':
			return { icon: Eye, color: 'text-cyan-500', label: 'Interest' };
		case 'pain':
		case 'sadness':
			return { icon: Droplet, color: 'text-blue-500', label: 'Pain/Sadness' };
		case 'negative':
			return { icon: Frown, color: 'text-red-500', label: 'Negative' };
		default:
			return { icon: Meh, color: 'text-yellow-500', label: 'Neutral' };
	}
};

// Mock data for plant metrics
export const plantMetricsData = [
	{
		timestamp: '00:00',
		soilMoisture: 30,
		waterLevel: 50,
		temperature: 22,
		humidity: 60,
		lightIntensity: 800,
		wateringEvents: 0,
	},
	{
		timestamp: '04:00',
		soilMoisture: 28,
		waterLevel: 48,
		temperature: 20,
		humidity: 65,
		lightIntensity: 0,
		wateringEvents: 0,
	},
	{
		timestamp: '08:00',
		soilMoisture: 25,
		waterLevel: 45,
		temperature: 23,
		humidity: 55,
		lightIntensity: 1200,
		wateringEvents: 1,
	},
	{
		timestamp: '12:00',
		soilMoisture: 35,
		waterLevel: 60,
		temperature: 26,
		humidity: 50,
		lightIntensity: 1500,
		wateringEvents: 0,
	},
	{
		timestamp: '16:00',
		soilMoisture: 32,
		waterLevel: 58,
		temperature: 25,
		humidity: 52,
		lightIntensity: 1000,
		wateringEvents: 0,
	},
	{
		timestamp: '20:00',
		soilMoisture: 30,
		waterLevel: 55,
		temperature: 24,
		humidity: 58,
		lightIntensity: 200,
		wateringEvents: 1,
	},
];