#include <FastLED.h>

// Define the number of LEDs in the strip
#define NUM_LEDS 4

// Define the data pin connected to the LED strip
#define DATA_PIN 3

// Create an array to hold the color data for each LED
CRGB leds[NUM_LEDS];

void setup()
{
  // Initialize the FastLED library
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
}

void loop()
{
  // Set the color of the first LED to red
  // leds[0] = CRGB::Red;

  // // Set the color of the second LED to green
  // leds[1] = CRGB::Green;

  // // Set the color of the third LED to blue
  // leds[2] = CRGB::Blue;

  // Set the rest of the LEDs to purple
  for (int i = 0; i < NUM_LEDS; i++)
  {
    leds[i] = CRGB::Purple;
  }

  // Update the strip with the new colors
  FastLED.show();


}
