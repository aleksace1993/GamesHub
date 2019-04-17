//NOTE: always starts from the topleft corner 2x2 block
function Pill(startX, startY){
    this.blocks = [];
    this.width = 2;
    this.height = 2;
    this.x = startX;
    this.y = startY;
    this.initBlocks(); 
}
Pill.prototype.initBlocks = function(){
    let block1 = new  Block(this.x, this.y, sharpSides.bottom);
    block1.pillRelX = 0; 
    block1.pillRelY = 0;
    let block2 = new  Block(this.x, this.y + 1, sharpSides.top);
    block2.pillRelX = 0;
    block2.pillRelY = 1;
    block1.pair = block2;
    block2.pair = block1;
    this.blocks.push(block1, block2);
    //Todo: over here we can initialize the shapes of the block
}

CanvasRenderingContext2D.prototype.roundRect3Sides = function(x,y,width,height,radius,sharpSide){
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    this.beginPath();
    this.moveTo(x+radius, y);

    if(sharpSide === sharpSides.top){
       //Arc from here to here
        // -----
        this.lineTo(x+width, y);
       //       |
       //       |
       //       |
       //       /
        this.arcTo(x+width, y+height, x, y+height, radius);
       // \_____ 
        this.arcTo(x,y+height, x, y, radius);
       // |
       // |
       // |
       // |
       // \ 
        this.lineTo(x, y, radius);
    }
    if(sharpSide === sharpSides.left){
        this.arcTo(x+width, y, x+width, y+height, radius);
        this.arcTo(x+width, y+height, x, y+height, radius);
        this.lineTo(x,y+ height);
        this.lineTo(x,y);        
    }
    if(sharpSide === sharpSides.right){
        this.lineTo(x+width, y);
        this.lineTo(x+width, y+height);
        this.arcTo(x,y+height, x, y, radius);
        this.arcTo(x, y, x+width, y, radius);
    }
    if(sharpSide === sharpSides.bottom){
        this.arcTo(x+width, y, x+width, y+height, radius);
        this.lineTo(x+width, y+height);
        this.lineTo(x,y+height);
        this.arcTo(x, y, x+width, y, radius);
    }
    this.closePath();
    //stroke and fill to outline the pills
    this.stroke();
    this.fill();

}