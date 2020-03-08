#include<LiquidCrystal.h>
LiquidCrystal lcd(12,11,5,4,3,2);

#define led 13 // the pin the LED is connected to

unsigned count=0;
int Contrast=120;

void setup()
{
  lcd.clear();
  pinMode(led, OUTPUT); // Declare the LED as an output
  digitalWrite(led, LOW); // Turn the LED off
  analogWrite(6,Contrast);
  lcd.begin(16,2);
  lcd.print("Visitor Counter");
  delay(2000);
  lcd.clear();
  lcd.print("Person In Room:");
  lcd.setCursor(0,1);
  lcd.print(count);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {

    count = Serial.read();
    if(count!=0)
  {
    lcd.clear();
    lcd.print("Person In Room:");
    digitalWrite(led, HIGH); // Turn the LED on
    lcd.setCursor(0,1);
    lcd.print(count);
    delay(100);
  }
  else {
    digitalWrite(led, LOW); // Turn the LED off
    lcd.clear();
    lcd.print("Nobody in Room");
    lcd.setCursor(0,1);
    lcd.print("Light is Off");
    delay(100);
  }
    //lcd.setCursor(0,1);
    //lcd.print(count);
  }
}
