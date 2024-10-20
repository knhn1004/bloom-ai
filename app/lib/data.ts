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

import { db } from '../firebase.config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { PlantMetrics } from './interfaces';

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

export const setupPlantMetricsListener = (callback: (data: PlantMetrics[]) => void) => {
  const plantMetricsRef = collection(db, 'iot_data');
  const q = query(plantMetricsRef, orderBy('timestamp', 'desc'), limit(24));

  return onSnapshot(q, (querySnapshot) => {
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      console.log('Raw Firestore data:', docData);
      return {
        timestamp: docData.timestamp?.toDate().toLocaleString() || 'N/A',
        soilMoisture: docData.soilMoisture || docData.soil_moisture || 0,
        temperature: docData.temperature || 0,
        humidity: docData.humidity || 0,
        lightIntensity: docData.lightIntensity || docData.light_intensity || 0,
      };
    });
    console.log('Transformed data:', data);
    callback(data.reverse());
  });
};
