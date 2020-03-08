import cv2  
import numpy as np
import serial
import time

face_cascade = cv2.CascadeClassifier('C:\\Users\\acer\\Anaconda3\\Library\\etc\\haarcascades\\haarcascade_frontalface_default.xml') 
ser = serial.Serial('COM4', 9600)

  
# capture frames from a camera 
cap = cv2.VideoCapture(0) 
  
# loop runs if capturing has been initialized. 
while 1:  
  
    # reads frames from a camera 
    ret, img = cap.read()  
  
    # convert to gray scale of each frames 
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) 
  
    # Detects faces of different sizes in the input image 
    faces = face_cascade.detectMultiScale(gray, 1.3, 5) 
    
    #print (type(faces))
 
    if len(faces) == 0:
        print ("No of face :" + str(len(faces)))
        time.sleep(0.1)
        ser.write(bytes([0]))
 
        
    else:
        print (faces)
        #print (faces.shape)
        print ("Number of faces detected: " + str(faces.shape[0]))
        for (x, y, w, h) in faces:
            cv2.rectangle(img, (x, y), (x+w, y+h), (165, 252, 83), 2)
        cv2.rectangle(img, ((0,img.shape[0] -25)),(270, img.shape[0]), (255,255,255), -1)
        cv2.putText(img, "Number of faces detected: " + str(faces.shape[0]), (0,img.shape[0] -10), cv2.FONT_HERSHEY_TRIPLEX, 0.5,  (0,0,0), 1)
        time.sleep(0.1)
        ser.write(bytes([int(faces.shape[0])]))

    # Display an image in a window 
    cv2.imshow('img',img) 
  
    # Wait for Esc key to stop 
    k = cv2.waitKey(100) & 0xff
    if k == 27: 
        time.sleep(0.1)
        ser.write(bytes([0]))
        ser.close()
        break
  
# Close the window 
cap.release() 
  
# De-allocate any associated memory usage 
cv2.destroyAllWindows()  