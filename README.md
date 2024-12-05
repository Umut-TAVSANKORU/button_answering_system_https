# Introduction
This is a system for a contest that has more than two teams and needs to know which team wanted to answer first. It is used by opening an url on contestants phones and another url on your host for deciding when there is a question. It uses web sockets to maintain connection.
# How to use
## Readying the system
open the folder that you downloaded on a command line and write 
- node index.js

dont close the command line as it will be needed to know who answered.

on your computer, go to your internet browser and go to the following url:
- localhost:(the port you specified)/admin
### Opening your hotspot
You will need to be on the same lan so ensure:
- You dont have a vpn
- you are not connected to other internet mediums(optional)

then open your devices hotspot.
## Connecting the partipicants
Ensure that the partipicants:
- Dont have a vpn enabled
- Arent using mobile data
- Connected to your hotspot

Next, get your local ip adress:
- (For Windows) open cmd and type ipconfig. Locate Wireless LAN Adapter that doesnt say WiFi or media disconnected and take the ipv4 adress.

After, take a phone from each team and go to the following url:
- (Your ipv4 adress you got just now):(the port you specified)/

They should get a number and tell you.
## Working the system
Once you press start question, the teams can press the button on their phone to answer. You will see the team number on the console you hopefully havent closed. On top of that, once you start a new question it will say "nq".Once a team answers, they cant answer anymore.

When you want to start a new question, press end question and after that, start question. You can also only press end question and leave the system at idle at any time. They cant press the answer button in this state or when someone else answers.
