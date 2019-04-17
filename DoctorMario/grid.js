function Grid(game) {
    this.game = game;
    this.playableGridWidthInPixels = GAME_CONFIG.blockSizeInPixels * GAME_CONFIG.gridWidthInBlocks;
    this.playableGridHeightInPixels = GAME_CONFIG.blockSizeInPixels * GAME_CONFIG.gridHeightInBlocks;
    this.canvasOffsetX;
    this.canvasOffsetY;
    //these are not needed atm
    //this.totalGridHeightInpixels = this.playableGridHeightInPixels + this.bonusGridHeight + this.borderHeight*2;
    // this.totalGridWidthInpixels = this.playableGridWidthInPixels + this.borderWidth*2;
    this.backgroundColor = "#000000";
    this.pill;
    this.nextPill = new Pill(GAME_CONFIG.nextPillStartX, GAME_CONFIG.nextPillStartY);
    this.shouldSpawnNewPill = true;
    this.shouldCheckForPairs = false;
    this.shoulCheckForFlyingBlocks = false;
    this.AllBlocks = [];
    this.availableVirusSpots = [];
    this.Viruses = [];
    this.Explosions = [];
    this.getAvailableVirusesLocations();
};
Grid.prototype.checkIfGameIsOver = function(newBlockY){
    return newBlockY - GAME_CONFIG.pillStartY <= 3; 
};
Grid.prototype.getAvailableVirusesLocations = function(){
    for(let x = 0; x < GAME_CONFIG.gridWidthInBlocks; x++){
        for(let y = GAME_CONFIG.virusSpawnOffsetY; y < GAME_CONFIG.gridHeightInBlocks; y++){
            this.availableVirusSpots.push({x: x, y: y});
        }
    }
}
Grid.prototype.initializeVirusesForLevel= function(level){
    let numViruses = GAME_CONFIG.numVirusesPerLevel[level];
    for(let i = 0; i < numViruses; i++){
    let virusLocation = this.getRandomVirusLocation();
    let newVirus = new Block(virusLocation.x, virusLocation.y, null);
    newVirus.isVirus = true;
    newVirus.getImage();
    this.Viruses.push(newVirus);
    };
}
Grid.prototype.getRandomVirusLocation = function(){
    let totalSpacesToPopulate = this.availableVirusSpots.length;
    let randy = Math.random();
    let newRandom = Math.floor(randy * totalSpacesToPopulate);
    
    let newLocation = this.availableVirusSpots[newRandom];
    this.availableVirusSpots.splice(newRandom,1);
    return newLocation;
}

Grid.prototype.getLevelSpeed = function(level){
    return GAME_CONFIG.levelSpeed[level];
}
Grid.prototype.checkBoundaries = function (x, y) {
    return x >= 0 && x < GAME_CONFIG.gridWidthInBlocks && y >= 0 && y < GAME_CONFIG.gridHeightInBlocks;
}
Grid.prototype.checkIfReachedBottom = function (x, y) {
    return y === GAME_CONFIG.gridHeightInBlocks 
        || this.blockOrVirusAt(x,y);
}
Grid.prototype.blockOrVirusAt = function (x, y) {
    return (this.AllBlocks.some(block => {
            return block.gridRelX === x && block.gridRelY === y;})
            || this.Viruses.some(vir => {
            return vir.gridRelX === x && vir.gridRelY === y;}));         
}
Grid.prototype.getBlockAt = function (x, y) {
    return this.AllBlocks.find(block => {
             return block.gridRelX === x && block.gridRelY === y;});         
}
Grid.prototype.getBlockOrVirusAt = function (x, y) {
    return (this.AllBlocks.find(block => {
             return block.gridRelX === x && block.gridRelY === y;})
            || this.Viruses.find(vir => {
             return vir.gridRelX === x && vir.gridRelY === y;}));         
}
Grid.prototype.shiftAllBlocks = function(){
    //Blocks should be sorted by descending at this point
    for(let x = 0; x < GAME_CONFIG.gridWidthInBlocks; x++){
        for(let y = GAME_CONFIG.gridHeightInBlocks; y > 0; y--){
           let blockToTest = this.getBlockAt(x,y);
              if(blockToTest){
               blockToTest.doGravity(marioGrid);
           } 
        }
    }
};
Grid.prototype.FallRoundOfBlocks = function(){
    timing.FallNowTime = timeStamp();
    //every 30ms or so, make blocks fall down
    if(timing.blockFallCountdown < GAME_CONFIG.gridHeightInBlocks)
    {
        timing.dtFall = timing.FallNowTime - timing.FallLastTime;
        if(timing.dtFall >= timing.blockFallSpeed){
            timing.dtFall -= timing.blockFallSpeed;
            //Shift
            this.shiftAllBlocks();
            timing.blockFallCountdown++;
            timing.FallLastTime = timeStamp();
        }
        timing.FallNowTime = timeStamp();
    }else{
        //blocks fully fell
        timing.blockFallCountdown = 0;
        //start checking again
        this.shouldCheckForPairs = true;
        this.shoulCheckForFlyingBlocks = false;
    }
}
Grid.prototype.AddExplosion = function(gridRelX, gridRelY){
    this.Explosions.push(new Explosion(gridRelX, gridRelY));
}
Grid.prototype.removeBlockOrVirus = function(pairBlocks){
    for(let i = 0; i < pairBlocks.length; i++){
        if(pairBlocks[i].isVirus){ 
            this.Viruses.splice(this.Viruses.findIndex(v=>v.gridRelX == pairBlocks[i].gridRelX && v.gridRelY == pairBlocks[i].gridRelY), 1);
        }else{
            let blockToRemoveIndex = this.AllBlocks.findIndex(block=>block.gridRelX == pairBlocks[i].gridRelX && block.gridRelY == pairBlocks[i].gridRelY);
            //the pairs pair to null
            let blocksPair = this.AllBlocks[blockToRemoveIndex].pair;
            if(blocksPair){
                blocksPair.pair = null;
            }
            this.AllBlocks.splice(blockToRemoveIndex, 1);
        }
        this.AddExplosion(pairBlocks[i].gridRelX, pairBlocks[i].gridRelY);
    }
    this.shoulCheckForFlyingBlocks = true;
}
Grid.prototype.getSameColoredPair = function(pairBlocks){
    let sameColored = [];
    let blockToTestAgainst = pairBlocks[0];
    sameColored.push(blockToTestAgainst);
    //start at one since we got the color of the first one
    for(let i = 1; i < pairBlocks.length; i++){
        if(blockToTestAgainst.color === pairBlocks[i].color){
            sameColored.push(pairBlocks[i]);
        }else{
            //Test existing ones // Example: from 0 to 4
            if(sameColored.length >= GAME_CONFIG.minPairsForPoints){
                //return the array cause we're removing 1 pair at a time
                return sameColored;
            }
            //Reset to test more //Example: 5-6
            sameColored = [];
            //test against the next color in the consequtive blocks
            blockToTestAgainst = pairBlocks[i];
            sameColored.push(blockToTestAgainst);
        }
    }
    return sameColored;
}
Grid.prototype.checkForHorizontalPairs = function(){
    let horizontalPairs = [];
    let consequentialSameColoredBlocks = [];
    //Note: go one past the last one so it can hit the else statement when its done calculating the blocks
    for(let y = 0; y <= GAME_CONFIG.gridHeightInBlocks; y++){
        horizontalPairs = [];
        for(let x = 0; x <= GAME_CONFIG.gridWidthInBlocks; x++){
            let blockOrVirus = this.getBlockOrVirusAt(x,y);
            if(blockOrVirus){
                horizontalPairs.push(blockOrVirus);
            }else{
                consequentialSameColoredBlocks = this.getSameColoredPair(horizontalPairs);
                if(consequentialSameColoredBlocks.length >= GAME_CONFIG.minPairsForPoints){
                    return consequentialSameColoredBlocks;
                }   
                horizontalPairs = [];
            }
        }
    }
    
    return [];
}
Grid.prototype.drawControls = function(){
    let fontHeight = 30;
    let fontColor = "#FF0000";
    this.game.context.font = fontHeight+"px Verdana";
    this.game.context.fillStyle = fontColor;
    this.game.context.fillText('Controls: Arrows ', 10, 100+ fontHeight);
    this.game.context.fillText('Rotate: Up-Arrow ', 10, 100+ 2*fontHeight);
}
Grid.prototype.drawStats = function(){
    let fontHeight = 30;
    let fontColor = "#FF0000";
    this.game.context.font = fontHeight+"px Verdana";
    this.game.context.fillStyle = fontColor;
    this.game.context.fillText('Level: '+ GameState.currentLevel , 10, 10+ fontHeight);
    this.game.context.fillText('Viruses: '+ this.Viruses.length , 10, 10+ 2*fontHeight);
  //  this.game.context.fillText('Score: '+ GameState.score , 10, 10+ 3*fontHeight);
}
Grid.prototype.checkForVerticalPairs = function(){
    let verticalPairs = [];
    let consequentialSameColoredBlocks = [];
    //Note: go one past the last one if the counting reached the end and we hit the else statement
    for(let x = 0; x <= GAME_CONFIG.gridWidthInBlocks; x++){
        verticalPairs = [];
        for(let y = 0; y <= GAME_CONFIG.gridHeightInBlocks; y++){
            let blockOrVirus = this.getBlockOrVirusAt(x,y);
            if(blockOrVirus){
                verticalPairs.push(blockOrVirus);
            }else{
                consequentialSameColoredBlocks = this.getSameColoredPair(verticalPairs);
                if(consequentialSameColoredBlocks.length >= GAME_CONFIG.minPairsForPoints){
                    return consequentialSameColoredBlocks;
                }   
                verticalPairs = [];
            }
        }
    }
    
    return [];
}
Grid.prototype.checkForPairs = function(){
    this.shouldCheckForPairs = false;
    let blocksToRemove = [];
    let horizontalPairs = this.checkForHorizontalPairs();
    blocksToRemove = blocksToRemove.concat(horizontalPairs);
    let verticalPairs = this.checkForVerticalPairs();
    blocksToRemove = blocksToRemove.concat(verticalPairs);

    let uniqueItems = Array.from(new Set(blocksToRemove));
    if(uniqueItems.length >= GAME_CONFIG.minPairsForPoints){
        this.removeBlockOrVirus(uniqueItems);
    }
}
Grid.prototype.updatePill = function (transformation) {
    if(!this.pill){
        return;
    }
    let notBlockedPath = true;
    //Check against new position
    for (let i = 0; i < 2; i++) {
        let newBlockX;
        let newBlockY
        if(transformation.rotate){
            //rotation
            let newBlock = this.pill.blocks[i].getNextRotation();
            newBlockX = this.pill.x + newBlock.pillRelX;
            newBlockY = this.pill.y + newBlock.pillRelY;
        }else{
            //translation
            newBlockX = this.pill.blocks[i].gridRelX + transformation.x;
            newBlockY = this.pill.blocks[i].gridRelY + transformation.y;
        }
        
        let blockIsInBounds = this.checkBoundaries(newBlockX, newBlockY) && !this.blockOrVirusAt(newBlockX, newBlockY);
        if (!blockIsInBounds) {
            notBlockedPath = false;
        }

        //if moving down
        if (transformation.y === 1) {
            let reachedBottom = this.checkIfReachedBottom(newBlockX, newBlockY);
            if (reachedBottom) {
                let isGameOver = this.checkIfGameIsOver(newBlockY);
                if(isGameOver){
                    EndGame(marioGame.frameHandle);
                    console.log("game Over");
                    break;
                }
                this.AllBlocks.push(this.pill.blocks[0], this.pill.blocks[1]);
                this.pill = null;
                this.shouldSpawnNewPill = true;
                this.shouldCheckForPairs = true;
                break;
            }
        }
    }
    //at this point neither of the pill blocks is blocked by anything
    if (notBlockedPath) {
        if(transformation.rotate === 1){
            //rotate
            for (let i = 0; i < 2; i++) {
                this.pill.blocks[i].applyRotation(this.pill.x, this.pill.y);
            }
        }else{
            //translate
            this.pill.x += transformation.x;
            this.pill.y += transformation.y;
            for (let i = 0; i < 2; i++) {
               this.pill.blocks[i].gridRelX += transformation.x;
                this.pill.blocks[i].gridRelY += transformation.y;
            } 
        }  
    }

}
Grid.prototype.drawGrid = function (startX, startY) {
    //NOTE: offset including the border
    this.canvasOffsetX = startX + this.game.borderThickness;
    this.canvasOffsetY = startY + this.game.borderThickness;
    this.game.context.fillStyle = this.backgroundColor;
    this.game.context.fillRect(this.canvasOffsetX, this.canvasOffsetY, this.playableGridWidthInPixels, this.playableGridHeightInPixels);
};

Grid.prototype.drawAllBlocks = function () {
    this.AllBlocks.forEach(block => {
        let blockCanvasRelX = this.canvasOffsetX + block.gridRelX * GAME_CONFIG.blockSizeInPixels;
        let blockCanvasRelY = this.canvasOffsetY + block.gridRelY * GAME_CONFIG.blockSizeInPixels;

        this.game.context.fillStyle = block.color;
        this.game.context.roundRect3Sides(blockCanvasRelX,
                                          blockCanvasRelY,
                                          GAME_CONFIG.blockSizeInPixels,
                                          GAME_CONFIG.blockSizeInPixels,
                                          GAME_CONFIG.pillCornerRadius,
                                          block.sharpSide);
    });
};
Grid.prototype.drawPillBlocks = function (pill) {
    pill.blocks.forEach(block => {
        let blockCanvasRelX = this.canvasOffsetX + (pill.x+ block.pillRelX) * GAME_CONFIG.blockSizeInPixels;
        let blockCanvasRelY = this.canvasOffsetY + (pill.y+ block.pillRelY) * GAME_CONFIG.blockSizeInPixels;

        this.game.context.fillStyle = block.color;
        this.game.context.roundRect3Sides(blockCanvasRelX,
            blockCanvasRelY,
            GAME_CONFIG.blockSizeInPixels,
            GAME_CONFIG.blockSizeInPixels,
            GAME_CONFIG.pillCornerRadius,
            block.sharpSide);
    });
};
Grid.prototype.drawAllViruses = function(){
    this.Viruses.forEach(vir => {
    let virusCanvasRelX = this.canvasOffsetX + vir.gridRelX * GAME_CONFIG.blockSizeInPixels;
    let virusCanvasRelY = this.canvasOffsetY + vir.gridRelY * GAME_CONFIG.blockSizeInPixels

    this.game.context.drawImage(vir.image, virusCanvasRelX, virusCanvasRelY, GAME_CONFIG.blockSizeInPixels, GAME_CONFIG.blockSizeInPixels);
    });
};
Grid.prototype.drawAllExplosions = function(){
    this.Explosions.forEach(exp => {
        let explosionCanvasRelX = this.canvasOffsetX + exp.gridRelX * GAME_CONFIG.blockSizeInPixels;
        let explosionCanvasRelY = this.canvasOffsetY + exp.gridRelY * GAME_CONFIG.blockSizeInPixels;
        //make the explosion bigger by every countdown
        let explosionSize = exp.explosionCountdown > 60 ?   GAME_CONFIG.blockSizeInPixels / 2:  GAME_CONFIG.blockSizeInPixels;
        this.game.context.drawImage(explosionImage, explosionCanvasRelX, explosionCanvasRelY, explosionSize, explosionSize);
   
        exp.explosionCountdown--;
    });
    //remove all the explosions that are done
    let explosionThatIsDoneIndex = this.Explosions.findIndex(ex=>ex.explosionCountdown <=0);
    this.Explosions.splice(explosionThatIsDoneIndex, 1);
};
