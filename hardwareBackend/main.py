import serial
import time
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Replace with your ThingSpeak API key from environment variable
THINGSPEAK_API_KEY = os.getenv("THINGSPEAK_API_KEY")

# Configure serial port (update port if necessary)
serial_port = "/dev/ttyACM0" #linux
# serial_port = "COM10" #windows


baud_rate = 9600

# Open the serial connection
ser = serial.Serial(serial_port, baud_rate, timeout=1)
time.sleep(2)  # Give some time for the connection to establish


def parse_sensor_data(data):
    """
    Parses the serial data in the format:
    Humidity: 45.00%, Temp: 24.00°C / 75.20°F, Heat index: 25.00°C / 77.00°F, Light: 345, Soil Moisture: 689
    """
    try:
        data = data.strip()
        # Extract values from the string
        humidity = float(data.split("Humidity: ")[1].split("%")[0])
        temp_c = float(data.split("Temp: ")[1].split("°C")[0])
        temp_f = float(data.split("/ ")[1].split("°F")[0])
        light = int(data.split("Light: ")[1].split(",")[0])
        soil_moisture = int(data.split("Soil Moisture: ")[1])

        return humidity, temp_c, temp_f, light, soil_moisture
    except Exception as e:
        print(f"Error parsing sensor data: {e}")
        return None, None, None, None, None


def update_thingspeak(humidity, temp_c, temp_f, light, soil_moisture):
    """
    Send data to ThingSpeak via HTTP GET request.
    """
    try:
        # Construct the ThingSpeak API URL
        url = f"https://api.thingspeak.com/update?api_key={THINGSPEAK_API_KEY}&field1={humidity}&field2={temp_c}&field3={temp_f}&field4={light}&field5={soil_moisture}"
        response = requests.get(url)
        if response.status_code == 200:
            print(f"Data successfully sent to ThingSpeak: {response.text}")
        else:
            print(f"Failed to send data to ThingSpeak: {response.status_code}")
    except Exception as e:
        print(f"Error sending data to ThingSpeak: {e}")


# Continuously read from serial and send data to ThingSpeak
while True:
    if ser.in_waiting > 0:
        # Read the serial data
        serial_data = ser.readline().decode("utf-8")
        print(f"Received: {serial_data}")

        # Parse the sensor data
        humidity, temp_c, temp_f, light, soil_moisture = parse_sensor_data(serial_data)

        # If data was parsed successfully, send it to ThingSpeak
        if humidity is not None:
            update_thingspeak(humidity, temp_c, temp_f, light, soil_moisture)

    # Add a small delay before the next reading
    time.sleep(15)  # Update every 15 seconds as per ThingSpeak's rate limit
