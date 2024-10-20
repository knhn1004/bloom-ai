import serial
import time
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Replace with your ThingSpeak API key from environment variable
THINGSPEAK_API_KEY = os.getenv("THINGSPEAK_API_KEY")
rateLimit = 15  # ThingSpeak allows updates every 15 seconds

# Configure serial port (update port if necessary)
serial_port = "/dev/ttyACM0"  # Linux
# serial_port = "COM10"  # Windows

baud_rate = 115200

# Open the serial connection
ser = serial.Serial(serial_port, baud_rate, timeout=1)
time.sleep(1)  # Give some time for the connection to establish

# Flush any existing input data
ser.flushInput()


def parse_sensor_data(data):
    """
    Parses the serial data in the format:
    Humidity: 40.00 / Temp: 22.80 / 73.04 / Light: 682 / Soil Moisture: 582
    """
    try:
        data = data.strip()
        # Extract values from the string
        humidity = float(data.split("Humidity: ")[1].split(" /")[0])
        temp_c = float(data.split("Temp: ")[1].split(" /")[0])
        temp_f = float(data.split("/ ")[2].split(" /")[0])
        light = int(data.split("Light: ")[1].split(" /")[0])
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


# Initialize time of last update
last_update_time = time.time() - rateLimit  # Initialize to ensure immediate update

# Continuously read from serial and send data to ThingSpeak
while True:
    # Read the serial data
    try:
        serial_data = ser.readline().decode("utf-8", errors="replace")
        if serial_data.strip() != "":
            print(f"Received: {serial_data}")

            # Parse the sensor data
            humidity, temp_c, temp_f, light, soil_moisture = parse_sensor_data(
                serial_data
            )

            # If data was parsed successfully
            if humidity is not None:
                print(
                    f"Parsed Data: Humidity={humidity}, TempC={temp_c}, TempF={temp_f}, Light={light}, SoilMoisture={soil_moisture}"
                )
                current_time = time.time()
                # Update ThingSpeak every 'rateLimit' seconds
                if current_time - last_update_time >= rateLimit:
                    update_thingspeak(humidity, temp_c, temp_f, light, soil_moisture)
                    last_update_time = current_time
    except Exception as e:
        print(f"Error reading or processing serial data: {e}")

    # Small sleep to prevent overloading the CPU
    time.sleep(rateLimit)
