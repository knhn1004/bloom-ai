'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import {
	Thermometer,
	Droplet,
	Sun,
	Sprout,
	PhoneCall,
	PhoneOff,
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
import { processUserInput } from './actions/groq-chat';
import {
	useDeepgram,
	LiveConnectionState,
	LiveTranscriptionEvents,
	LiveTranscriptionEvent,
} from './context/DeepgramContextProvider';
import {
	useMicrophone,
	MicrophoneState,
	MicrophoneEvents,
} from './context/MicrophoneContextProvider';

// Mock data for plant metrics
const plantMetricsData = [
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

// TypeScript interfaces
interface Message {
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

//interface PlantMetrics {
//	timestamp: string;
//	soilMoisture: number;
//	waterLevel: number;
//	temperature: number;
//	humidity: number;
//	lightIntensity: number;
//	wateringEvents: number;
//}

export default function Dashboard() {
	const [messages, setMessages] = useState<Message[]>([]);

	const { connection, connectToDeepgram, connectionState } = useDeepgram();
	const {
		setupMicrophone,
		microphone,
		startMicrophone,
		stopMicrophone,
		microphoneState,
	} = useMicrophone();

	const [isListening, setIsListening] = useState(false);

	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setupMicrophone();
	}, [setupMicrophone]);

	useEffect(() => {
		if (microphoneState === MicrophoneState.Ready && isListening) {
			connectToDeepgram({
				model: 'nova-2',
				interim_results: true,
				smart_format: true,
				filler_words: true,
				utterance_end_ms: 3000,
			});
		}
	}, [microphoneState, connectToDeepgram, isListening]);

	useEffect(() => {
		if (!microphone || !connection) return;

		const onData = (e: BlobEvent) => {
			if (e.data.size > 0) {
				connection.send(e.data);
			}
		};

		let lastTranscript = '';

		const onTranscript = async (data: LiveTranscriptionEvent) => {
			const transcript = data.channel.alternatives[0].transcript;
			if (transcript !== '' && data.is_final) {
				console.log('Final transcript:', transcript);
				if (transcript !== lastTranscript) {
					await handleUserInput(transcript);
					lastTranscript = transcript;
				}
			}
		};

		if (connectionState === LiveConnectionState.OPEN && isListening) {
			connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
			microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
			startMicrophone();
		}

		return () => {
			connection.removeListener(
				LiveTranscriptionEvents.Transcript,
				onTranscript
			);
			microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
			if (isListening) {
				stopMicrophone();
			}
		};
	}, [
		connectionState,
		connection,
		microphone,
		startMicrophone,
		stopMicrophone,
		isListening,
	]);

	useEffect(() => {
		// Scroll to the bottom of the chat area when messages change
		if (scrollAreaRef.current) {
			const scrollContainer = scrollAreaRef.current.querySelector(
				'[data-radix-scroll-area-viewport]'
			);
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	}, [messages]);

	const handleUserInput = async (input: string) => {
		setMessages(prev => [...prev, { role: 'user', content: input }]);
		const aiResponse = await processUserInput(input);
		setMessages(prev => [...prev, { role: 'ai', ...aiResponse } as Message]);
	};

	const toggleConnection = async () => {
		if (!isListening) {
			setIsListening(true);
			await connectToDeepgram({
				model: 'nova-2',
				language: 'en-US',
				interim_results: true,
				smart_format: true,
				filler_words: true,
				utterance_end_ms: 1000,
			});
		} else {
			setIsListening(false);
			connection?.finish();
			stopMicrophone();
		}
	};

	const getSentimentInfo = (sentiment?: string) => {
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

	return (
		<div className="container mx-auto p-4 bg-gradient-to-br from-green-50 to-blue-50">
			<h1 className="text-4xl font-bold mb-6 text-gray-900">Bloom AI</h1>

			<div className="grid grid-cols-1 gap-6">
				{/* Voice AI Agent Section */}
				<Card className="rounded-2xl shadow-lg overflow-hidden">
					<CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
						<CardTitle className="text-xl sm:text-2xl">
							Bloom AI Voice Assistant
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 sm:p-6">
						<ScrollArea
							className="h-[300px] sm:h-[400px] w-full mb-4"
							ref={scrollAreaRef}
						>
							<div className="pr-4">
								{' '}
								{/* Add padding-right to account for scrollbar */}
								{messages.map((msg, index) => {
									const {
										icon: SentimentIcon,
										color,
										label,
									} = getSentimentInfo(msg.sentiment);
									return (
										<div
											key={index}
											className={`mb-4 ${
												msg.role === 'user' ? 'text-right' : 'text-left'
											}`}
										>
											<div
												className={`inline-block max-w-[80%] sm:max-w-md p-3 sm:p-4 rounded-2xl ${
													msg.role === 'user'
														? 'bg-blue-100 text-blue-900'
														: 'bg-green-100 text-green-900'
												}`}
											>
												<p className="text-sm sm:text-base">{msg.content}</p>
												{msg.sentiment && (
													<div className="flex items-center mt-2 text-xs">
														<SentimentIcon
															className={`w-4 h-4 ${color} mr-1`}
														/>
														<span>{label}</span>
													</div>
												)}
											</div>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>
						</ScrollArea>
						<div className="flex justify-center">
							<Button
								onClick={toggleConnection}
								className={`rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center ${
									isListening
										? 'bg-red-500 hover:bg-red-600'
										: 'bg-green-500 hover:bg-green-600'
								}`}
							>
								{isListening ? (
									<PhoneOff className="w-6 h-6 sm:w-8 sm:h-8" />
								) : (
									<PhoneCall className="w-6 h-6 sm:w-8 sm:h-8" />
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Plant Metrics Section */}
				<Card className="col-span-1 md:col-span-2 rounded-2xl shadow-lg">
					<CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
						<CardTitle className="text-2xl">Plant Metrics</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							<Card className="bg-blue-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Thermometer className="w-8 h-8 text-blue-500 mr-2" />
									<div>
										<p className="text-sm text-blue-700">Temperature</p>
										<p className="text-2xl font-bold text-blue-900">24°C</p>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-green-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Droplet className="w-8 h-8 text-green-500 mr-2" />
									<div>
										<p className="text-sm text-green-700">Humidity</p>
										<p className="text-2xl font-bold text-green-900">60%</p>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-yellow-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Sun className="w-8 h-8 text-yellow-500 mr-2" />
									<div>
										<p className="text-sm text-yellow-700">Light Intensity</p>
										<p className="text-2xl font-bold text-yellow-900">
											800 lux
										</p>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-purple-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Sprout className="w-8 h-8 text-purple-500 mr-2" />
									<div>
										<p className="text-sm text-purple-700">Growth</p>
										<p className="text-2xl font-bold text-purple-900">Good</p>
									</div>
								</CardContent>
							</Card>
						</div>
						<Tabs defaultValue="soilMoisture">
							<TabsList className="grid w-full grid-cols-3 rounded-xl bg-green-100">
								<TabsTrigger
									value="soilMoisture"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Soil Moisture
								</TabsTrigger>
								<TabsTrigger
									value="waterLevel"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Water Level
								</TabsTrigger>
								<TabsTrigger
									value="wateringEvents"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Watering Events
								</TabsTrigger>
							</TabsList>
							{['soilMoisture', 'waterLevel', 'wateringEvents'].map(metric => (
								<TabsContent key={metric} value={metric}>
									<Card className="rounded-xl">
										<CardContent className="p-0">
											<ChartContainer
												config={{
													[metric]: {
														label:
															metric.charAt(0).toUpperCase() +
															metric.slice(1).replace(/([A-Z])/g, ' $1'),
														color: 'hsl(142, 76%, 36%)', // Green color
													},
												}}
												className="h-[300px]"
											>
												<ResponsiveContainer width="100%" height="100%">
													<LineChart data={plantMetricsData}>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis dataKey="timestamp" />
														<YAxis />
														<ChartTooltip content={<ChartTooltipContent />} />
														<Legend />
														<Line
															type="monotone"
															dataKey={metric}
															stroke="hsl(142, 76%, 36%)"
															activeDot={{ r: 8 }}
														/>
													</LineChart>
												</ResponsiveContainer>
											</ChartContainer>
										</CardContent>
									</Card>
								</TabsContent>
							))}
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
