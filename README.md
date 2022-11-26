# Hotpot Battle
https://hotpot-battle.herokuapp.com/ (Best played on monitors above 1200 x 800px)  

## Gameplay Preview
![image](https://user-images.githubusercontent.com/86651236/204081740-bdaa9f78-8dbd-4328-98dd-e680d208a00d.png)
![image](https://user-images.githubusercontent.com/86651236/204081754-e34c2121-94f4-403f-b11c-a0c906dec627.png)
![image](https://user-images.githubusercontent.com/86651236/204082021-d916e2ac-3d10-4422-b6fd-8de3f238cdf1.png)

### Extra Features
1. Choose chef
2. Choose pot
3. Music and volume slider
4. Mute button
5. Chef with tips
6. Help button and overlay
7. Dark mode and smoke toggle
8. Animated glowing title
9. Toggle hearts broadcast
10. Authentication to conduct server-wide reset (password: "battleship")

### Requirements
#### Client
- Client connects to server first and gets information about other clients from 
server program.  
- Each client knows what server’s address and server’s port are. Server’s IP and 
port will be set in your program’s source code.  
- Can put your nickname when the game starts.  
- Welcome message appears on the game starts.  
- Player’s name and score are appeared on the game client.  
- There are ships and grid table as user interface and all ships can be placed on 
the grid.  
- Player cannot see each other ship’s position.  
- Time can be counted down.  
- After the attack position is selected, it has to be marked as “hit” or “miss”.  
- Increase scores when a ship is hit.  

#### Server 
- Server program shows the number of concurrent clients that are online.  
- Server has a reset button to reset player’s scores and current game.  
- Server randomizes first player that will start the game.  

## For Developers
We are using yarn (instead of npm) so here are the commands to use:
### Install and update to the latest yarn release
```
npm install --global yarn  
yarn install --frozen-lockfile  
```
### Run on localhost:3000
```
yarn run dev  
```
