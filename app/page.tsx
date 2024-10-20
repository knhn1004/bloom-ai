'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import Markdown from 'react-markdown';
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

import { getSentimentInfo, setupPlantMetricsListener } from './lib/data';
import type { Message, PlantMetrics } from './lib/interfaces';
import { toggleDeepgramConnection } from './actions/deepgram-chat';
import { db } from './firebase.config';
import { onSnapshot, collection, orderBy, query } from 'firebase/firestore';
import { getImageDescription } from './actions/groq-image';
import Image from 'next/image';

export default function Dashboard() {
	const [messages, setMessages] = useState<Message[]>([]);

	const [isListening, setIsListening] = useState(false);
	const [chatId, setChatId] = useState('');

	const [plantMetrics, setPlantMetrics] = useState<PlantMetrics[]>([]);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [imageDescription, setImageDescription] = useState<{
		imageUrl: string;
		description: string;
	} | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);

	useEffect(() => {
		if (chatId) {
			const messagesRef = collection(db, 'chats', chatId, 'messages');
			const q = query(messagesRef, orderBy('timestamp', 'asc'));

			const unsubscribe = onSnapshot(q, snapshot => {
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
		const unsubscribe = setupPlantMetricsListener(data => {
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

	const handleGetImageDescription = async () => {
		setIsAnalyzing(true);
		const result = await getImageDescription();
		setImageDescription(result);
		setIsAnalyzing(false);
	};

	function PlantModel() {
		const { scene } = useGLTF('/models/plant.glb');
		return (
			<>
				<primitive
					object={scene}
					scale={[2.5, 2.5, 2.5]}
					position={[0, -1.5, 0]} // Move the plant down
				/>
				<OrbitControls
					enableZoom={false}
					enablePan={false}
					enableRotate={true}
					minPolarAngle={Math.PI / 2} // Restrict vertical rotation
					maxPolarAngle={Math.PI / 2} // Restrict vertical rotation
				/>
				<Environment preset="sunset" background />
				<ambientLight intensity={0.5} />
				<spotLight
					position={[10, 10, 10]}
					angle={0.15}
					penumbra={1}
					intensity={1}
					castShadow
				/>
			</>
		);
	}

	return (
		<div className="container mx-auto p-4 bg-gradient-to-br from-green-50 to-blue-50">
			<h1 className="text-4xl font-bold mb-6 text-gray-900 flex items-center">
				🪴 Bloom AI
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Voice AI Agent Section */}
				<Card className="rounded-t-2xl shadow-lg overflow-hidden">
					<CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
						<CardTitle className="text-xl sm:text-2xl">
							Bloom AI Assistant
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

				{/* 3D Model Section */}
				<Card className="rounded-t-2xl shadow-lg">
					<CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
						<CardTitle className="text-2xl">3D Plant Model</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						<div className="h-[300px] sm:h-[400px] w-full">
							<Canvas camera={{ position: [0, 0, 7], fov: 75 }}>
								<PlantModel />
							</Canvas>
						</div>
					</CardContent>
				</Card>

				{/* Plant Metrics Section */}
				<Card className="col-span-1 md:col-span-2 rounded-t-2xl shadow-lg mt-6">
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
											{plantMetrics.length > 0
												? `${
														plantMetrics[plantMetrics.length - 1].temperature
												  }°F`
												: 'N/A'}
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
											{plantMetrics.length > 0
												? `${plantMetrics[plantMetrics.length - 1].humidity}%`
												: 'N/A'}
										</p>
									</div>
								</CardContent>
							</Card>
							<Card className="bg-yellow-100 rounded-xl">
								<CardContent className="p-4 flex items-center">
									<Sun className="w-8 h-8 text-yellow-500 mr-2" />
									<div>
										<p className="text-sm text-yellow-700">Intensity</p>
										<p className="text-2xl font-bold text-yellow-900">
											{plantMetrics.length > 0
												? `${
														plantMetrics[plantMetrics.length - 1].lightIntensity
												  } lux`
												: 'N/A'}
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
											{plantMetrics.length > 0
												? `${(
														(plantMetrics[plantMetrics.length - 1]
															.soilMoisture /
															1000) *
														100
												  ).toFixed(2)}%`
												: 'N/A'}
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
						<Tabs defaultValue="temperature">
							<TabsList className="grid w-full grid-cols-4 rounded-xl bg-green-100">
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
									Intensity
								</TabsTrigger>
								<TabsTrigger
									value="soilMoisture"
									className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
								>
									Moisture
								</TabsTrigger>
							</TabsList>
							{[
								'soilMoisture',
								'temperature',
								'humidity',
								'lightIntensity',
							].map(metric => (
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

				{/* Image Description Section */}
				<Card className="col-span-1 md:col-span-2 rounded-t-2xl shadow-lg mt-6">
					<CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white flex justify-between items-center">
						<CardTitle className="text-2xl">Plant Image Analysis</CardTitle>
						<Button
							onClick={handleGetImageDescription}
							variant="secondary"
							size="sm"
							className="bg-white text-green-500 hover:bg-green-100"
							disabled={isAnalyzing}
						>
							{isAnalyzing ? (
								<>
									<span className="mr-2">Analyzing...</span>
									<svg
										className="animate-spin h-4 w-4 text-green-500"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								</>
							) : (
								'Analyze'
							)}
						</Button>
					</CardHeader>
					<CardContent className="p-6">
						{isAnalyzing ? (
							<div className="flex items-center justify-center h-64">
								<svg
									className="animate-spin h-10 w-10 text-green-500"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							</div>
						) : (
							<>
								<div className="relative w-full h-64 mb-4">
									{imageDescription && (
										<Image
											src={imageDescription.imageUrl}
											alt="Plant Image"
											width={500}
											height={300}
											style={{ objectFit: 'contain', width: '100%', height: '100%' }}
										/>
									)}
								</div>
								<Markdown>{imageDescription?.description}</Markdown>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
