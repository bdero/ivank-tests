// Global variables

var MAX_ITERATIONS = 50;
var JULIA_BOUNDS = new Rectangle(-1, -1, 2, 2);

var stage; var b;

// System functions

function start() {
    stage = new Stage('c');
    b = new Bitmap(newStageBitmap());

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
	this.r*this.r + this.i*this.i,
	2*this.r*this.i
    );
}

// Julia set functions

function drawJulia() {
    b.bitmapData.setPixels(
	b.bitmapData.rect,
	juliaRender(new Point(0, 0), new Point(-1, -1), new Point(1, 1))
    );
}

function juliaRender(complex, displayMin, displayMax) {
    var buff = new Uint8Array(b.bitmapData.width*b.bitmapData.height*4);
var asdf = 0;
    for (var h = 0; h < b.bitmapData.height; h++) {
	var hp = h/b.bitmapData.height;
	var hInput = (displayMax.y - displayMin.y)*hp + displayMin.y;

	for (var w = 0; w < b.bitmapData.width; w++) {
	    var wp = w/b.bitmapData.width;
	    var wInput = (displayMax.x - displayMin.x)*wp + displayMin.x;

	    var pixel = new Point(wInput, hInput);
	    var escaped;
	    for (var i = 0; i < MAX_ITERATIONS; i++) {
		pixel.setTo(
		    pixel.x*pixel.x + complex.x,
		    pixel.y*pixel.y + complex.y
		);

		if (!JULIA_BOUNDS.containsPoint(pixel)) {
		    escaped = i;
		    break;
		}
	    }

	    var red, green, blue;
	    if (escaped) {
		console.log("escape");
		red = green = blue = 0xaa;
	    } else {
		red = green = blue = 0x55;
		asdf++;
	    }

	    buff.set([red, green, blue, 0x00], (h*b.bitmapData.width + w)*4);
	}
    }
    console.log(b.bitmapData.rect);
    console.log(asdf);
    return buff;
}
