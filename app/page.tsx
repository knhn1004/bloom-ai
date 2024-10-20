'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
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
} from 'lucide-react';
//import { processUserInput } from './actions/groq-chat';

import { getSentimentInfo, setupPlantMetricsListener } from './lib/data';
import type { Message, PlantMetrics } from './lib/interfaces';
import { toggleDeepgramConnection } from './actions/deepgram-chat';
import { db } from './firebase.config';
import { onSnapshot, collection } from 'firebase/firestore';

export default function Dashboard() {
	const [messages, setMessages] = useState<Message[]>([]);

	const [isListening, setIsListening] = useState(false);
	const [chatId, setChatId] = useState('');

	const [plantMetrics, setPlantMetrics] = useState<PlantMetrics[]>([]);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chatId) {
			const messagesRef = collection(db, 'chats', chatId, 'messages');

			const unsubscribe = onSnapshot(messagesRef, snapshot => {
				const newMessages = snapshot.docs.map(doc => ({
					id: doc.id,
					...(doc.data() as Omit<Message, 'id'>),
				})) as Message[];
				setMessages(newMessages);
			});

			return () => unsubscribe();
		}
	}, [chatId]);

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

	useEffect(() => {
		const unsubscribe = setupPlantMetricsListener((data) => {
		  setPlantMetrics(data);
		});
	  
		return () => {
		  if (unsubscribe) {
			unsubscribe();
		  }
		};
	  }, []);	

	const toggleConnection = async () => {
		if (isListening) {
			await toggleDeepgramConnection('stop', chatId);
		} else {
			const chatId = Math.random().toString(36).substring(2, 15);
			console.log('chat_id: ', chatId);
			setChatId(chatId);
			await toggleDeepgramConnection('start', chatId);
		}
		setIsListening(prev => !prev);
	};

	//const handleUserInput = async (input: string) => {
	//	setMessages(prev => [...prev, { role: 'user', content: input }]);
	//	const aiResponse = await processUserInput(input);
	//	setMessages(prev => [...prev, { role: 'ai', ...aiResponse } as Message]);
	//};

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
								{messages.length === 0 && (
									<div className="flex items-center justify-center mb-4 text-green-500">
										<Sprout className="w-8 h-8 mr-2" />
										<div className="text-center">
											Ask me anything about plant care and mindfulness.
										</div>
									</div>
								)}
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
										<p className="text-2xl font-bold text-blue-900">
											{plantMetrics.length > 0 ? `${plantMetrics[plantMetrics.length - 1].temperature}°C` : 'N/A'}
										</p>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-green-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Droplet className="w-8 h-8 text-green-500 mr-2" />
									<div>
										<p className="text-sm text-green-700">Humidity</p>
										<p className="text-2xl font-bold text-green-900">
											{plantMetrics.length > 0 ? `${plantMetrics[plantMetrics.length - 1].humidity}%` : 'N/A'}
										</p>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-yellow-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Sun className="w-8 h-8 text-yellow-500 mr-2" />
									<div>
										<p className="text-sm text-yellow-700">Light Intensity</p>
										<p className="text-2xl font-bold text-yellow-900">
											{plantMetrics.length > 0 ? `${plantMetrics[plantMetrics.length - 1].lightIntensity} lux` : 'N/A'}
										</p>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-purple-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Sprout className="w-8 h-8 text-purple-500 mr-2" />
									<div>
										<p className="text-sm text-purple-700">Soil Moisture</p>
										<p className="text-2xl font-bold text-purple-900">
											{plantMetrics.length > 0 ? `${plantMetrics[plantMetrics.length - 1].soilMoisture}%` : 'N/A'}
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
						<Tabs defaultValue="soilMoisture">
							<TabsList className="grid w-full grid-cols-4 rounded-xl bg-green-100">
								<TabsTrigger
									value="soilMoisture"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Soil Moisture
								</TabsTrigger>
								<TabsTrigger
									value="temperature"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Temperature
								</TabsTrigger>
								<TabsTrigger
									value="humidity"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Humidity
								</TabsTrigger>
								<TabsTrigger
									value="lightIntensity"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Light Intensity
								</TabsTrigger>
							</TabsList>
							{['soilMoisture', 'temperature', 'humidity', 'lightIntensity'].map(metric => (
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
											>
												<LineChart data={plantMetrics}>
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
