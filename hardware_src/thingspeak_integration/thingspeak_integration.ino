#include <WiFi.h>
#include "DHT.h"
#include <FastLED.h>
#include <ThingSpeak.h>
#include "secret.h"

// WiFi credentials from "secret.h"
const char* ssid  = SECRET_SSID;
const char* password = SECRET_PASS;

// ThingSpeak credentials
int channelID = THINGSPEAK_CHANNEL;
const char* apiKey = THINGSPEAK_API_KEY;

// Pin definitions for ESP32-S3
#define DHTPIN 2        // DHT11 data pin
#define SOIL_PIN 5      // Soil moisture sensor pin
#define PHOTO_PIN 1     // Photoresistor pin
#define DHTTYPE DHT11   // DHT11 sensor type

#define NUM_LEDS 4
#define DATA_PIN 3      // Pin for controlling LEDs

// Initialize sensors
DHT dht(DHTPIN, DHTTYPE);
WiFiClient client;
CRGB leds[NUM_LEDS];

// Variables for sensor readings
float temperature;
float humidity;
int soilMoisture;
int lightLevel, reversedLightLevel;

// Function to set RGB values for all LEDs
void setRGB(int red, int green, int blue) {
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB(red, green, blue);  // Set the RGB color for each LED
  }
  FastLED.show();  // Update the strip with the new colors
}

void setup() {
  Serial.begin(115200);

  // Initialize WiFi connection
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // Initialize sensors
  dht.begin();
  
  // Initialize LEDs
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);

  // Initialize ThingSpeak
  ThingSpeak.begin(client);
}   

void readSensors() {
  // Read DHT11 sensor (humidity & temperature)
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  // Read soil moisture sensor
  soilMoisture = analogRead(SOIL_PIN);

  // Read light level
  lightLevel = analogRead(PHOTO_PIN);
  reversedLightLevel = map(lightLevel, 0, 4096, 4096, 0);

  // Print readings to Serial
  Serial.println("Sensor Readings:");
  Serial.println("Temperature: " + String(temperature) + "°C");
  Serial.println("Humidity: " + String(humidity) + "%");
  Serial.println("Soil Moisture: " + String(soilMoisture));
  Serial.println("Light Level: " + String(reversedLightLevel));

  // ----- RGB Lighting Logic -----
  String condition = "";  // Store the condition to print in one line
  if (soilMoisture < 300) {
    setRGB(0, 0, 255);  // Blue indicates the plant needs water
    condition = "Low soil moisture, RGB: Blue";
  } else if (temperature > 30) {
    setRGB(255, 0, 0);  // Red indicates too much heat
    condition = "High temperature, RGB: Red";
  } else if (lightLevel < 200) {
    setRGB(255, 255, 0);  // Yellow indicates the plant needs more light
    condition = "Low light, RGB: Yellow";
  } else if (humidity > 50) {
    setRGB(0, 255, 0);  // Green indicates the plant is in optimal condition
    condition = "High humidity, RGB: Green";
  } else {
    setRGB(128, 0, 128);  // Purple for normal or no significant issues
    condition = "Normal, RGB: Purple";
  }

  // Print RGB lighting condition
  Serial.println("Condition: " + condition);
}

void sendToThingSpeak() {
  // Set fields for ThingSpeak
  ThingSpeak.setField(1, temperature);
  ThingSpeak.setField(2, humidity);
  ThingSpeak.setField(3, soilMoisture);
  ThingSpeak.setField(4, lightLevel);

  // Send data to ThingSpeak
  int response = ThingSpeak.writeFields(channelID, apiKey);
  if (response == 200) {
    Serial.println("Data sent to ThingSpeak successfully");
  } else {
    Serial.println("Error sending data to ThingSpeak");
  }
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost! Reconnecting...");
    WiFi.begin(ssid, password);
    return;
  }

  // Read sensors
  readSensors();

  // Send data to ThingSpeak
  sendToThingSpeak();

  // ThingSpeak has a rate limit of 15 seconds
  delay(15000);
}
