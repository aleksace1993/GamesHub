function Game() {
    this.canvas;
    this.context;
    this.width;
    this.height;
    this.borderThickness;
    this.frameHandle;
};
Game.prototype.initializeGame = function (gameWidth, gameHeight, borderThickness) {
    this.width = gameWidth;
    this.height = gameHeight;
    this.borderThickness = borderThickness;
    this.initializeCanvas();
};
Game.prototype.initializeCanvas = function () {
    this.canvas = document.querySelector("canvas");
    this.canvas.setAttribute("width", this.width + this.borderThickness * 2);
    this.canvas.setAttribute("height", this.height + this.borderThickness * 2);
    this.context = this.canvas.getContext("2d");
}
Game.prototype.drawBackground = function (backgroundColor) {
    this.context.fillStyle = backgroundColor;
    this.context.fillRect(0 + this.borderThickness, 0 + this.borderThickness, this.width, this.height);
}
Game.prototype.drawBorder = function (borderColor) {
    this.context.fillStyle = borderColor;
    this.context.fillRect(0,
        0,
        this.borderThickness,
        this.height + this.borderThickness);
    this.context.fillRect(this.width + this.borderThickness,
        this.borderThickness,
        this.borderThickness,
        this.height + this.borderThickness);
    this.context.fillRect(this.borderThickness,
        0,
        this.width + this.borderThickness,
        this.borderThickness);
    this.context.fillRect(0,
        this.height + this.borderThickness,
        this.width + this.borderThickness,
        this.borderThickness);
}