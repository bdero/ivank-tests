var stage, bitmap;
var greyscale = false;

function start() {
    stage = new Stage('c');
    bitmap = new Bitmap(newBitmapData());
    stage.addChild(bitmap);

    stage.addEventListener(Event.RESIZE, resize);
    stage.addEventListener(Event.ENTER_FRAME, update);
    stage.addEventListener(MouseEvent.CLICK, toggleGreyscale);
}

function resize() { bitmap.bitmapData = newBitmapData() }

function newBitmapData() { return BitmapData.empty(stage.stageWidth, stage.stageHeight) }

function toggleGreyscale() { greyscale = !greyscale }

function update() {
    var ab = new ArrayBuffer(bitmap.bitmapData.width*bitmap.bitmapData.height*4);
    var a32 = new Uint32Array(ab);
    
    if (greyscale)
	var randColor = function() {
	    var c = Math.floor(0xff*Math.random());
	    return c | c << 8 | c << 16;
	};
    else
	var randColor = function() { return Math.floor(0xffffff*Math.random()) };
    
    for (var i = 0; i < a32.length; i++) {
	a32[i] = 0xff000000 | randColor();
    }
    bitmap.bitmapData.setPixels(bitmap.bitmapData.rect, new Uint8Array(ab));
}
