//Setting out the colors 
const backgroundColor = "#231f20";
const snakeColor = "#c2c2c2";
const foodColor = "#e66916";
const snakeColor2 = "#FF0000"

//Server connection for socket.io
const socket = io("http://localhost:3000");
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknowGame", handleUnknownGame);
socket.on("toManyPlayers", handleToManyPlayers);

//Get frontend components into the backend
const initScreen = document.getElementById("initalScreen");
const gameScreen = document.getElementById("gameScreen");
const newGameBtn = document.getElementById("newGameBtn");
const joinGameBtn = document.getElementById("joinGameBtn");
const gameCodeInput = document.getElementById("gameCodeInput")
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);


let canvas, ctx;
let playerNumber;
let gameActive = false;

//Join and new game functions
function newGame(){
    socket.emit("newGame");
    init(); //Run init function when screen loads
}   

function joinGame(){
    const code = gameCodeInput.value;
    socket.emit("joinGame", code);
    init(); //Run init function when screen loads
}

//Init function to set up the game screen 
function init(){
    initScreen.style.display = "none";
    gameScreen.style.display = "block";
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.height = 500
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    document.addEventListener("keydown", keydown);
    gameActive = true;
}

//What happens when a key is pressed 
function keydown(e){
    socket.emit("keydown", e.keyCode);
}

//Print out game state
function paintGame(state){
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    const food = state.food;
    const gridSize = state.gridSize;
    const size = canvas.width / gridSize

    ctx.fillStyle = foodColor;
    ctx.fillRect(food.x * size, food.y * size, size, size);
    console.log(state.gridSize)
    paintPlayer(state.players[0], size, snakeColor);
    paintPlayer(state.players[1], size, snakeColor2);
}

//Generate the player one screen
function paintPlayer(playerState, size, color){
    const snake = playerState.snake;
    
    ctx.fillStyle = color;

    //Loop thro all the snake cells and output current location onto screen
    for(let cell of snake){
        ctx.fillRect(cell.x * size, cell.y * size, size, size)
    }
}

//Not sure if this needed now
function handleInit(number){
    playerNumber = number;
}

//Connect to the server and update the frontend with the game state
function handleGameState(gameState){
    if(!gameActive){
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => {
        paintGame(gameState);
    });
}


//Set what happens when the game ends 
function handleGameOver(data){
    if(!gameActive){
        return;
    }
    data = JSON.parse(data);

    if(data.winner === playerNumber){
        alert("You Win")
        location.reload(); //MIGHT REMOVE
    }
    else{
        alert("You Lose")
        location.reload(); //MIGHT REMOVE
    }
    gameActive = false;
}

//Output game code to screen
function handleGameCode(gameCode){
    gameCodeDisplay.innerText = (gameCode);
}

//WHat happens if there is an inccoret gamecode
function handleUnknownGame(){
    reset();
    alert("Unknown Game Code");
}


//What happens if there is to many players already in a room 
function handleToManyPlayers(){
    reset();
    alert("To many players in that room");
}

function reset(){
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initScreen.style.display = "block";
    gameScreen.style.display = "none";
}