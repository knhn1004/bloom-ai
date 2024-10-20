# Bloom AI: Smart Plant Monitoring System

![Bloom AI Logo](/public/banner.svg)

Bloom AI is an innovative plant health monitoring system that combines IoT sensors, AI, and data visualization to help you take better care of your plants.

## Features

- **Real-time Plant Monitoring**: Track temperature, humidity, soil moisture, and light levels.
- **AI-powered Plant Assistant**: Get answers to your plant care questions.
- **3D Plant Visualization**: View your plant's health status in an interactive 3D model.
- **Data Analytics**: Visualize trends and patterns in your plant's health data.
- **Image Analysis**: Upload plant images for AI-powered health assessment.

![1](https://github.com/user-attachments/assets/bd04b7f5-7c80-4445-a7d2-2a5bc8cadd1d)

## Technology Stack

- Frontend: Next.js, React, TypeScript
- Backend: Node.js, FastAPI, ThingSpeak 
- IoT: Arduino, ESP8266/ESP32
- APIs: ThingSpeak, Groq, Deepgram
- Data Visualization: Recharts
- 3D Rendering: Three.js

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Arduino IDE
- ThingSpeak account
- Groq API key
- Hume API key

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/bloom-ai.git
   ```

2. Install dependencies:

   ```
   cd bloom-ai
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
   THINGSPEAK_API_KEY=your_thingspeak_api_key
   GROQ_API_KEY=your_groq_api_key
   HUME_API_KEY=your_hume_api_key
   ```

4. Run the development server:

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Hardware Setup

1. Connect the sensors to your Arduino or ESP8266/ESP32 board according to the wiring diagram.
2. Upload the `main_code.ino` sketch to your board.
3. Configure your Wi-Fi credentials in the `secrets.h` file.

![Hardware Setup](https://github.com/user-attachments/assets/ecc061ae-c0c7-4216-9fc4-62b835601bba)
![IMG_0576](https://github.com/user-attachments/assets/c8f88efd-d941-45bc-baab-8545c19462a6)
![IMG_0575](https://github.com/user-attachments/assets/a8ba4115-1bc9-453b-bafc-22afe9abf57e)

## Usage

1. Place the sensor near your plant.
2. Access the Bloom AI dashboard through your web browser.
3. Monitor your plant's health metrics in real-time.
4. Ask the AI assistant for plant care advice.
5. Upload images of your plant for detailed analysis.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- ThingSpeak for IoT data platform
- Groq for AI language model and computer vision analysis
- Deepgram for Voice AI 
