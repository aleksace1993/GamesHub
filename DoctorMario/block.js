//NOTE: If a block is from a pill its relX is for the pill 
function Block(x,y,sharpSide){
    this.color = getRandomColor();
    this.gridRelX = x;
    this.gridRelY = y;
    this.pillRelX;
    this.pillRelY;
    this.sharpSide = sharpSide;
    this.isVirus = false;
    this.image = null;
    //TODO: include Pair functionality
    this.pair = null;
};
const sharpSides = {
    bottom : 0,
    left : 1,
    top : 2,
    right : 3,
};
const sidesAndRotations = {
    //NOTE: sharpSides constant values as rotation positions for a block in a 2x2 grid
    // 00 10   We're using the sharp side of the pill to orient ourselves for rotations
    // 01 11   When the pill is in a vertical position, it is on the left side of the 2x2 Pill relative position 
    // the pill rotates clockwise
    0:{'pillRelX': 0, 'pillRelY': 0}, // bottom
    1:{'pillRelX': 1, 'pillRelY': 1}, // left
    2:{'pillRelX': 0, 'pillRelY': 1}, // top
    3:{'pillRelX': 0, 'pillRelY': 1}, // right
}
const blue = "#6196ed";
function getRandomColor(){
    let randy = Math.random();
    let newRandom = Math.floor(randy * 3);
    let result;
    if(newRandom === 0){
        result = "#FFFF00";
    }else if(newRandom === 1){
        result = blue;
    }else{
        result = "#FF0000";
    }
    return result;
};
Block.prototype.getImage = function(){
    if(this.color == "#FF0000"){
        this.image = new Image();
        this.image.src = Assets.redVirus;
    }else if(this.color == blue){
        this.image = new Image();
        this.image.src = Assets.blueVirus;
    }else{
        this.image = new Image();
        this.image.src = Assets.yellowVirus;
    }
}
Block.prototype.getNextRotation = function(){
    let nextRotation =  (this.sharpSide + 1) % 4;
    let newPos = sidesAndRotations[nextRotation];
    return newPos;
}
Block.prototype.applyRotation = function(pillX, pillY){
    let nextRotation =  (this.sharpSide + 1) % 4;
    let newPos = sidesAndRotations[nextRotation];
    this.sharpSide = nextRotation;
    this.pillRelX = newPos.pillRelX;
    this.pillRelY = newPos.pillRelY;

    this.gridRelX = pillX + this.pillRelX;
    this.gridRelY = pillY + this.pillRelY;
}
Block.prototype.fall = function(){
    this.gridRelY += 1;
}
Block.prototype.shouldFall = function(marioGrid){
    let nextPosX = this.gridRelX;
    let nextPosY = this.gridRelY +1;
    if(!marioGrid.checkIfReachedBottom(nextPosX, nextPosY)){
        return true;
    }
    return false;
}
Block.prototype.doGravity = function(grid){
    if(this.sharpSide == sharpSides.bottom || this.sharpSide == sharpSides.top){
        //if they are one on top of another dont count them as pairs
        this.pair = null;
    }
    if(this.pair){
        //if both of their next positions are eligable: fall.
        if(this.pair.shouldFall(grid) && this.shouldFall(grid)){
            this.fall();
            this.pair.fall();
        }
        //cant fall...
    }else{
        if(this.shouldFall(grid)){
            this.fall();
        }
    }
}
const explosionImage = new Image();
explosionImage.src = Assets.explosion; 
function Explosion(x,y){
    this.gridRelX = x;
    this.gridRelY = y;
    this.explosionCountdown = 120;
}