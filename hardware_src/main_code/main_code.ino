#include "DHT.h"

#define DHTPIN 2      // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11 // DHT 11

DHT dht(DHTPIN, DHTTYPE); // Initialize DHT sensor

void setup()
{
    // Begin serial communication
    Serial.begin(9600);
    // Serial.println(F("Integrated Sensor Readings:"));

    // Start the DHT sensor
    dht.begin();
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

        // Print all values in a single line
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
    }

}
