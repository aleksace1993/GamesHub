var marioGame;
var marioGrid;
var drMarioImage; 
var startMarioGame = function(){

    marioGame = new Game();
    marioGame.initializeGame(GAME_CONFIG.gameWindowWidth,GAME_CONFIG.gameWindowHeight, GAME_CONFIG.windowBorderThickness);
    
    marioGrid = new Grid(marioGame);
    marioGrid.initializeVirusesForLevel(GameState.currentLevel);
    GameState.pillSpeed = marioGrid.getLevelSpeed(GameState.currentLevel);
    marioGrid.drawGrid(GAME_CONFIG.gameGridOffsetX, GAME_CONFIG.gameGridOffsetY);    

    marioGame.frameHandle = window.requestAnimationFrame(UpdateAndRender);
    window.addEventListener("keydown",keyboardDownHandler);
    window.addEventListener("keyup",keyboardUpHandler);
   
    //configure mario
    drMarioImage = new Image();
    drMarioImage.src = Assets.doctorMario;
    marioGrid.nextPill = new Pill(GAME_CONFIG.nextPillStartX, GAME_CONFIG.nextPillStartY);

    console.log(GAME_CONFIG);
    var audio = new Audio('Assets/Soundtrack.mp3');
    audio.loop = true;
    //audio.play();

};
startMarioGame();

function logFpsEachSecond(){
    timing.OneSecondTime+=timing.desiredMSPerFrame;
    timing.frameCount++;
    if(timing.OneSecondTime > 1000.0){
        console.log(timing.frameCount);
        timing.frameCount = 0;
        timing.OneSecondTime = timing.OneSecondTime - 1000.0;  
    }
}
function drawNextPill(){
    marioGrid.drawPillBlocks(marioGrid.nextPill);
}

function drawDrMario(){
    marioGame.context.drawImage(drMarioImage, GAME_CONFIG.drMarioImageCanvasOffsetX, GAME_CONFIG.drMarioImageCanvasOffsetY, GAME_CONFIG.drMarioImageWidth, GAME_CONFIG.drMarioImageHeight);
}
function throwPill(flyingPill){
    //500 ms
   // timing.pillFlyTimedT 
   //marioGrid.drawPillBlocks(flyingPill);
}
function spawnNewPill(grid){
    let loopingThroughPairs = grid.shouldCheckForPairs || grid.shoulCheckForFlyingBlocks;
    if(loopingThroughPairs){
        //if the game is still trying to count the scores or shift the blocks, don't spawn the pill
        return false;
    }
    if(grid.shouldSpawnNewPill){
        //configure a new pill, flying pill
        let flyingPill = new Pill(GAME_CONFIG.nextPillStartY, GAME_CONFIG.nextPillStartY);
        flyingPill.blocks[0].color =  grid.nextPill.blocks[0].color;
        flyingPill.blocks[1].color =  grid.nextPill.blocks[1].color;
        grid.nextPill = new Pill(GAME_CONFIG.nextPillStartX, GAME_CONFIG.nextPillStartY);
        //Travel 500 ms
        let flyingPillArrived = 0;
        while(!flyingPillArrived){
            timing.pillFlyNowTime = timeStamp();
            timing.pillFlyTimedT = timing.pillFlyNowTime - timing.pillFlyStartTime;
            flyingPillArrived =timing.pillFlyTimedT >= timing.pillTravelTime;
            throwPill(flyingPill);
            if(flyingPillArrived){
                grid.pill =  new Pill(GAME_CONFIG.pillStartX, GAME_CONFIG.pillStartY);
                grid.pill.blocks[0].color = flyingPill.blocks[0].color;
                grid.pill.blocks[1].color = flyingPill.blocks[1].color;
                flyingPill = null;
                grid.shouldSpawnNewPill = false;
            } 
        }
    }
}
function automatedPillMovement(){
    GameState.pillSpeedThreshold += timing.desiredMSPerFrame;
    //Check if the threshold has been reached (1 second passed to move it),
    //Reset threshold once reached
    if(GameState.pillSpeedThreshold > GameState.pillSpeed){
        //move down the pill each second
        marioGrid.updatePill({x:0,y:1,rotation:0});
        GameState.pillSpeedThreshold -= GameState.pillSpeed;
    }
}
function UpdateAndRender(){
    timing.nowTime = timeStamp();
    timing.dt = timing.nowTime - timing.lastTime;
    //above 16.6666
    while(timing.dt >= timing.desiredMSPerFrame){
        if(marioGrid.Viruses.length === 0){
            //switch level
            GameState.currentLevel = Math.min(GameState.maxLevels, GameState.currentLevel+1);
            startMarioGame();
        }
        //refresh screen
        marioGame.drawBorder("#00FF00");
        marioGame.drawBackground(GAME_CONFIG.gameBackgroundColor);

        logFpsEachSecond();
        marioGrid.drawStats();
        marioGrid.drawControls();
        drawDrMario();
        drawNextPill();

        if(marioGrid.shouldCheckForPairs){
            //repeat cause we shifted
            marioGrid.checkForPairs();
        }
        if(marioGrid.shoulCheckForFlyingBlocks){
            marioGrid.FallRoundOfBlocks();
        }
        automatedPillMovement();
        //update 
        processInput(marioGrid);
        //draw
        marioGrid.drawGrid(GAME_CONFIG.gameGridOffsetX, GAME_CONFIG.gameGridOffsetY);
        if(marioGrid.pill){
            marioGrid.drawPillBlocks(marioGrid.pill);
        }
        marioGrid.drawAllExplosions();
        marioGrid.drawAllBlocks();
        marioGrid.drawAllViruses();
        marioGrid.drawStats();
        
        if(marioGrid.shouldSpawnNewPill){
            spawnNewPill(marioGrid);
        }

        timing.dt-= timing.desiredMSPerFrame;
        timing.lastTime = timing.nowTime;
    }
    marioGame.frameHandle = window.requestAnimationFrame(UpdateAndRender);
}
function keyboardUpHandler(event){
    //Note: Only ArrowDown is reset when you let go of the key, I'm trying to make it feel more like real doctor mario mechanics
    //The other keys are reset after each processing 
    if(event.key == 'ArrowDown'){
        event.preventDefault();
        KEY_CODES["BottomArrow"] = 0;
    }
};
function keyboardDownHandler(event){
    switch(event.key){
        case 'ArrowLeft':{
            event.preventDefault();
            KEY_CODES["LeftArrow"] = 1;
            break;
        }
        case 'ArrowRight':{
            event.preventDefault();
            KEY_CODES["RightArrow"] = 1;
            break;
        }
        case 'ArrowUp':{
            event.preventDefault();
            KEY_CODES["TopArrow"] = 1;
            break;
        }
        case 'ArrowDown':{
            event.preventDefault();
            KEY_CODES["BottomArrow"] = 1;
            break;
        }
        case 'Escape':{
            KEY_CODES["Escape"] = 1;
            break;
        }
        default:{}
    }
};
function processInput(grid){
    if(KEY_CODES["Escape"] === 1){
        EndGame(marioGame.frameHandle);
    }
    let transformation = {x:0, y:0, rotate:0 };
    if(KEY_CODES["LeftArrow"] === 1){
        transformation.x = -1
        grid.updatePill(transformation);
    }
    if(KEY_CODES["RightArrow"] === 1){
        transformation.x +=1;
        grid.updatePill(transformation);
    }
    if(KEY_CODES["BottomArrow"] === 1){
        //Disable moving bottom automatically if pressed a key... we should change this??
        GameState.pillSpeedThreshold = 0;

        transformation.y +=1;
        grid.updatePill(transformation);
    }
    if(KEY_CODES["TopArrow"] === 1){
        transformation.rotate = 1;
        grid.updatePill(transformation);
    }
    //UPDATE OTHER STUF HERE
    //Reset the keys to 0
    for(var k in KEY_CODES){
        if(k !== "BottomArrow"){
        KEY_CODES[k] = 0;
        }
    }
}
function EndGame(frameHandle){
    window.cancelAnimationFrame(frameHandle);
    //at this moment, just start a new game;
    GAME_CONFIG.currentLevel = 1;
    startMarioGame();
    
}

