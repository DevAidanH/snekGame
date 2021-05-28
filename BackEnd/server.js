const io = require("socket.io")();
const { makeid } = require("./utils")
const  { initGame, gameLoop, getUpdatedVel } = require("./game"); //Get the functions we need from game file
const { frameRate } = require("./constants"); //Get the framerate to refresh the game at from the constants file

//Global state
const state = {};
const clientRooms = {};

//On connection run gamestate
io.on("connection", client => {
    //Get keydown from the frontend
    client.on("keydown", handleKeyDown);

    //Listen for button press for new and join game
    client.on("newGame", handleNewGame);
    client.on("joinGame", handlejoinGame);

    function handleNewGame(){
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit("gameCode", roomName);
        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit("init", 1);
    }

    function handlejoinGame(gameCode){
        const room = io.sockets.adapter.rooms[gameCode];
        let allUsers;

        if(room){
            allUsers = room.sockets;
        }

        let numClients = 0;
        if(allUsers){
            numClients = Object.keys(allUsers).length;
        }

        if(numClients === 0){
            client.emit("unknowGame");
            return;
        }
        else if(numClients > 1){
            client.emit("toManyPlayers");
            return;
        }
        
        clientRooms[client.id] = gameCode;

        client.join(gameCode);
        client.number = 2;
        client.emit("init", 2);

        startGameInterval(gameCode);
    }

    //Get the keycode and make it into an int
    function handleKeyDown(keyCode){
        const roomName = clientRooms[client.id];

        if(!roomName){
            return;
        }

        try{
            keyCode = parseInt(keyCode);
        }catch(e){
            console.log(e);
            return;
        }

        //Send the keycode over to the game.js file
        const vel = getUpdatedVel(keyCode);

        if(vel){
            state[roomName].players[client.number - 1].vel = vel;
        }
    }

    
});



//If there is no winner then run game loop 
function startGameInterval(roomName){
    const intervalId = setInterval(() => { 
        const winner = gameLoop(state[roomName]); //Calls game loop in from the game.js file

        if(!winner){
            emitGameState(roomName, state[roomName]); //Send the gamestate to the frontend to print
        }
        else{
            emitGameOver(roomName, winner); //end the game
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / frameRate); //Set how oftern the game will refresh the screen (10 fps)
};

function emitGameState(roomName, state){
    io.sockets.in(roomName).emit("gameState", JSON.stringify(state));
}

function emitGameOver(roomName, winner){
    io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
}

io.listen(3000);