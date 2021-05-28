const { gridSize } = require("./constants"); //Get grid size from constants file

//Export the two functions we need to send to the server.js file
module.exports = {
    //createGameState,
    initGame,
    gameLoop,
    getUpdatedVel
}

function initGame(){
    const state = createGameState();
    randomFood(state);
    return state;
}

//Set up the gamestate
function createGameState(){
    return{ 
        players: [{
            pos: {
                x: 3,
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
            ]
        },        
        {
            pos: {
                x: 15,
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 17, y: 10},
                {x: 16, y: 10},
                {x: 15, y: 10},
            ]
        }],
        food: {},
        gridSize: gridSize,
    };
}

//The main game loop to handle movement and food generation
function gameLoop(state){
    if(!state){
        return
    }

    //Move the player position forward using the current verlocity 
    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    //Check if the player hits and edge and if so quit
    if(playerOne.pos.x < 0 || playerOne.pos.x > gridSize || playerOne.pos.y < 0 || playerOne.pos.y > gridSize){
        return 2;
    }
    if(playerTwo.pos.x < 0 || playerTwo.pos.x > gridSize || playerTwo.pos.y < 0 || playerTwo.pos.y > gridSize){
        return 1;
    }


    //Check if the player hits food and if so increase the snake size and move the player forward
    if(state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y){
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        randomFood(state); //Call random food function to generate new food
    }

    if(state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y){
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        randomFood(state); //Call random food function to generate new food
    }

    //Check if the player is moving and then move all seagemnts of the snake forward
    if(playerOne.vel.x || playerOne.vel.y){
        //Check if the player is touching itself and if so quit
        for(let cell of playerOne.snake){
            if(cell.x === playerOne.pos.x && cell.y === playerOne.pos.y){
                return 2;
            }
        }
        //Else move the player forward one 
        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }

    if(playerTwo.vel.x || playerTwo.vel.y){
        //Check if the player is touching itself and if so quit
        for(let cell of playerTwo.snake){
            if(cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y){
                return 1;
            }
        }
        //Else move the player forward one 
        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return false;
}

//Generate a new bit of food 
function randomFood(state){
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
    }

    //This loop makes sure that the food does not generate ontop of the player
    for(let cell of state.players[0].snake){
        if(cell.x === food.x && cell.y === food.y){
            return randomFood(state);
        }
    }

    for(let cell of state.players[1].snake){
        if(cell.x === food.x && cell.y === food.y){
            return randomFood(state);
        }
    }


    state.food = food;
}

//Get update velocity
function getUpdatedVel(keyCode){
    //Switch stsatemnt to check keycode
    switch(keyCode){
        case 37: { //left
            return {x: -1, y:0}
        }
        case 38: { //down
            return {x: 0, y:-1}
        }
        case 39: { //right
            return {x: 1, y:0}
        }
        case 40: { //up
            return {x: 0, y:1}
        }
    }
}