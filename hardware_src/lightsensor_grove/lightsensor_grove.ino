// light sensor
void setup()
{
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.print("On UART...");
}

void loop()
{
  int value = analogRead(A0);
  // put your main code here, to run repeatedly:
  Serial.println(value);
  delay(50);
}
