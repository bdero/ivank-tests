// Global variables

var MAX_ITERATIONS = 30;
var JULIA_BOUNDS = new Rectangle(-10, -10, 20, 20);

var stage, b;

// System functions

function start() {
    stage = new Stage('c');
    b = new Bitmap(newStageBitmap());
    stage.addChild(b);

    stage.addEventListener(Event.RESIZE, resetStageBitmap);
    stage.addEventListener(Event.ENTER_FRAME, drawJulia);
}

function resetStageBitmap() {
    b.bitmapData = newStageBitmap();
}

function newStageBitmap() {
    return BitmapData.empty(stage.stageWidth, stage.stageHeight);
}

// Compelx - complex number representation for arithmetic

function Complex(r, i) {
    this.r = r;
    this.i = i;
}

Complex.prototype.add = function(other) {
    return new Complex(
	this.r + other.r,
	this.i + other.i
    );
}

Complex.prototype.multiply = function(other) {
    return new Complex(
	this.r*other.r - this.i*other.i,
	this.r*other.i + this.i*other.r
    );
}

Complex.prototype.square = function() {
    return new Complex(
	this.r*this.r - this.i*this.i,
	2*this.r*this.i
    );
}

// Julia set functions

function drawJulia() {
    b.bitmapData.setPixels(
	b.bitmapData.rect,
	juliaRender(new Complex(0.25, 0), new Point(-2, -2), new Point(2, 2))
    );
}

function juliaRender(offset, displayMin, displayMax) {
    var buff = new Uint8Array(b.bitmapData.width*b.bitmapData.height*4);

    for (var h = 0; h < b.bitmapData.height; h++) {
	var hp = h/b.bitmapData.height;
	var hInput = (displayMax.y - displayMin.y)*hp + displayMin.y;

	for (var w = 0; w < b.bitmapData.width; w++) {
	    var wp = w/b.bitmapData.width;
	    var wInput = (displayMax.x - displayMin.x)*wp + displayMin.x;

	    var pixel = new Complex(wInput, hInput);
	    var escaped = undefined;
	    for (var i = 0; i < MAX_ITERATIONS; i++) {
		pixel = pixel.square().add(offset);

		if (!JULIA_BOUNDS.containsPoint(new Point(pixel.r, pixel.i))) {
		    escaped = i;
		    break;
		}
	    }

	    var red, green, blue;
	    if (escaped != undefined) {
		var escapeTime = escaped/MAX_ITERATIONS;
		red = 0xff*escapeTime;
		blue = 0xff - 0xff*escapeTime;
		green = 0x00;
	    } else {
		red = green = blue = 0x00;
	    }

	    buff.set([red, green, blue, 0xff], (h*b.bitmapData.width + w)*4);
	}
    }
    return buff;
}
