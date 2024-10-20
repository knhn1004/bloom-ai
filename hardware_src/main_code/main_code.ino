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
    Serial.begin(115200);
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
    delay(15000);

    // ----- DHT Sensor (Humidity & Temperature) -----
    float humidity = dht.readHumidity();
    float tempC = dht.readTemperature();
    float tempF = dht.readTemperature(true);

    // // Check if readings failed
    // if (isnan(humidity) || isnan(tempC) || isnan(tempF))
    // {
    //     Serial.println(F("Failed to read from DHT sensor!"));
    // }
    // else
    // {
        // Compute heat index
        // float heatIndexC = dht.computeHeatIndex(tempC, humidity, false);
        // float heatIndexF = dht.computeHeatIndex(tempF, humidity);

        // ----- Light Sensor (Analog Pin A0) -----
        int lightValue = map(analogRead(A0), 1023, 0, 0, 1023);

        // ----- Soil Moisture Sensor (Analog Pin A1) -----
        int soilMoistureValue = analogRead(A1); // Read the value from the soil moisture sensor

     
       // ----- RGB Lighting Logic -----
        if (soilMoistureValue < 500) {
            // Low soil moisture - set RGB to blue
            setRGB(0, 0, 255);  // Blue indicates the plant needs water
        } else if (tempC > 30) {
            // High temperature - set RGB to red
            setRGB(255, 0, 0);  // Red indicates too much heat
        } else if (lightValue < 500) {
            // Low light - set RGB to yellow
            setRGB(255, 255, 0);  // Yellow indicates the plant needs more light
        } else if (humidity > 50) {
            // High humidity - set RGB to green
            setRGB(0, 255, 0);  // Green indicates the plant is in optimal condition
        } else {
            // Default color - soft purple (relaxation mode)
            setRGB(128, 0, 128);  // Purple for normal or no significant issues
        }

           // Print all values in a single line
        Serial.print(F("Humidity: "));
        Serial.print(humidity);
        Serial.print(F(" / Temp: "));
        Serial.print(tempC);
        Serial.print(F(" / "));
        Serial.print(tempF);
        Serial.print(F(" / Light: "));
        Serial.print(lightValue);
        Serial.print(F(" / Soil Moisture: "));
        Serial.println(soilMoistureValue); // Print all values in a single line and then move to the next line

    // }
}
