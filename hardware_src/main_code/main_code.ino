#include "DHT.h"
#include <FastLED.h>

#define NUM_LEDS 4
#define DATA_PIN 3
CRGB leds[NUM_LEDS];

#define DHTPIN 2      // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11 // DHT 11

DHT dht(DHTPIN, DHTTYPE); // Initialize DHT sensor

void setup()
{
    // Begin serial communication
    Serial.begin(9600);
    // Serial.println(F("Integrated Sensor Readings:"));
    FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);

    // Start the DHT sensor
    dht.begin();
}

// Function to set RGB values for all LEDs
void setRGB(int red, int green, int blue)
{
    for (int i = 0; i < NUM_LEDS; i++)
    {
        leds[i] = CRGB(red, green, blue); // Set the RGB color for each LED
    }
    // Update the strip with the new colors
    FastLED.show();
}

void loop()
{
    // Wait a few seconds between measurements for DHT
    delay(2000);

    // ----- DHT Sensor (Humidity & Temperature) -----
    float humidity = dht.readHumidity();
    float tempC = dht.readTemperature();
    float tempF = dht.readTemperature(true);

    // Check if readings failed
    if (isnan(humidity) || isnan(tempC) || isnan(tempF))
    {
        Serial.println(F("Failed to read from DHT sensor!"));
    }
    else
    {
        // Compute heat index
        float heatIndexC = dht.computeHeatIndex(tempC, humidity, false);
        float heatIndexF = dht.computeHeatIndex(tempF, humidity);

        // ----- Light Sensor (Analog Pin A0) -----
        int lightValue = analogRead(A0); // Read the value from the light sensor

        // ----- Soil Moisture Sensor (Analog Pin A1) -----
        int soilMoistureValue = analogRead(A1); // Read the value from the soil moisture sensor

        // Print all sensor values
        Serial.print(F("Humidity: "));
        Serial.print(humidity);
        Serial.print(F("%, Temp: "));
        Serial.print(tempC);
        Serial.print(F("°C / "));
        Serial.print(tempF);
        Serial.print(F("°F, Heat index: "));
        Serial.print(heatIndexC);
        Serial.print(F("°C / "));
        Serial.print(heatIndexF);
        Serial.print(F("°F, Light: "));
        Serial.print(lightValue);
        Serial.print(F(", Soil Moisture: "));
        Serial.println(soilMoistureValue); // Print all values in a single line and then move to the next line

        // ----- RGB Lighting Logic -----
        if (soilMoistureValue < 300) {
            // Low soil moisture - set RGB to blue
            setRGB(0, 0, 255);  // Blue indicates the plant needs water
            Serial.println("Condition: Low soil moisture, setting RGB to Blue.");
            Serial.print("Soil Moisture Value: ");
            Serial.println(soilMoistureValue);
        } else if (tempC > 30) {
            // High temperature - set RGB to red
            setRGB(255, 0, 0);  // Red indicates too much heat
            Serial.println("Condition: High temperature, setting RGB to Red.");
            Serial.print("Temperature Value: ");
            Serial.println(tempC);
        } else if (lightValue < 200) {
            // Low light - set RGB to yellow
            setRGB(255, 255, 0);  // Yellow indicates the plant needs more light
            Serial.println("Condition: Low light, setting RGB to Yellow.");
            Serial.print("Light Sensor Value: ");
            Serial.println(lightValue);
        } else if (humidity > 50) {
            // High humidity - set RGB to green
            setRGB(0, 255, 0);  // Green indicates the plant is in optimal condition
            Serial.println("Condition: High humidity, setting RGB to Green.");
            Serial.print("Humidity Value: ");
            Serial.println(humidity);
        } else {
            // Default color - soft purple (relaxation mode)
            setRGB(128, 0, 128);  // Purple for normal or no significant issues
            Serial.println("Condition: Default, setting RGB to Purple.");
        }
    }
}
