var SQUARE_MAX_SIZE = 200;
var SQUARE_MAX_ALPHA = 0.5;
var SQUARE_MAX_RATE = 20; // Squares per frame
var SQUARE_MIN_RATE = 5;

var stage, b;

function start() {
    stage = new Stage('c');

    b = new Bitmap(emptyData());
    stage.addChild(b);

    stage.addEventListener(Event.RESIZE, resetMap);
    stage.addEventListener(Event.ENTER_FRAME, addSquare);
}

function resetMap() {
    b.bitmapData = emptyData();
}

function emptyData() {
    return BitmapData.empty(stage.stageWidth, stage.stageHeight);
}

function addSquare() {
    var square = new Sprite();

    var numOfSquares = Math.floor(
	Math.random()*(SQUARE_MAX_RATE - SQUARE_MIN_RATE)
    ) + SQUARE_MIN_RATE;

    for (var i = 0; i < numOfSquares; i++) {
	square.graphics.beginFill(0xffffff*Math.random(), Math.random()*SQUARE_MAX_ALPHA);
	var size = Math.random()*SQUARE_MAX_SIZE;
	square.graphics.drawRect(
	    Math.random()*(stage.stageWidth + size) - size,
	    Math.random()*(stage.stageHeight + size) - size,
	    size, size
	);
	square.graphics.endFill();
    }


    b.bitmapData.draw(square);
}
