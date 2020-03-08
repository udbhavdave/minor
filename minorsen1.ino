#include<LiquidCrystal.h>
LiquidCrystal lcd(12,11,5,4,3,2);

#define in 8
#define out 9
#define led 13 // the pin the LED is connected to
/*
#define relay 7
*/
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
  pinMode(in, INPUT);
  pinMode(out, INPUT);
  //pinMode(relay, OUTPUT);
  lcd.clear();
  lcd.print("Person In Room:");
  lcd.setCursor(0,1);
  lcd.print(count);
}

void loop()
{  
  int in_value = digitalRead(in);
  int out_value = digitalRead(out);
  if(in_value == LOW)
  {
    count++;
    lcd.clear();
    lcd.print("Person In Room:");
    lcd.setCursor(0,1);
    lcd.print(count);
    delay(1000);
  }
  
  if((out_value == LOW) && (count!=0))
  {
    count--;
    lcd.clear();
    lcd.print("Person In Room:");
    lcd.setCursor(0,1);
    lcd.print(count);
    delay(1000);
  }
 
  
  if(count==0)
  {
    lcd.clear();
    //digitalWrite(relay, HIGH);
    digitalWrite(led, LOW); // Turn the LED off
    lcd.clear();
    lcd.print("Nobody in Room");
    lcd.setCursor(0,1);
    lcd.print("Light is Off");
    delay(200);
  }
  
  else
  {
    //digitalWrite(relay, LOW);
    digitalWrite(led, HIGH); // Turn the LED on
  }
}
