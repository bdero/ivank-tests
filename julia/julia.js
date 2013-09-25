// Global variables

var MAX_ITERATIONS = 50;
//var JULIA_BOUNDS = new Rectangle(-10, -10, 20, 20);
var JULIA_BOUND = 10*10;

var stage, b, v;

// System functions

function start() {
    stage = new Stage('c');
    b = new Bitmap(newStageBitmap());
    stage.addChild(b);

    v = new Viewport(new Point(0, 0), 1);

    stage.addEventListener(Event.RESIZE, resetStageBitmap);
    stage.addEventListener(Event.ENTER_FRAME, updateJulia);
}

function resetStageBitmap() {
    b.bitmapData = newStageBitmap();
}

function newStageBitmap() {
    return BitmapData.empty(stage.stageWidth, stage.stageHeight);
}

// Rectangle extensions

Rectangle.prototype.left = function() { return this.x }

Rectangle.prototype.right = function() { return this.x + this.width }

Rectangle.prototype.top = function() {return this.y }

Rectangle.prototype.bottom = function() { return this.y + this.height }

// Viewport

function Viewport(center, zoom) {
    this.center = center;
    this.zoom = zoom;
}

Viewport.DEFAULT_SIZE = new Point(4, 4);

Viewport.prototype.getRect = function() {
    var ratio = stage.stageWidth/stage.stageHeight;

    var ox = Viewport.DEFAULT_SIZE.x/this.zoom;
    var oy = Viewport.DEFAULT_SIZE.y/this.zoom;
    ox = (ox + ox*ratio)/2; oy = (oy + oy/ratio)/2;

    return new Rectangle(
	this.center.x - ox/2, this.center.y - oy/2,
	ox, oy
    );
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

function updateJulia() {
    v.zoom*=1.1;
    b.bitmapData.setPixels(
	//new Rectangle(0, 0, b.bitmapData.width, 30),
	b.bitmapData.rect,
	juliaRender(new Complex(-0.835, -0.2321/*Math.random()*3 - 1.5, Math.random()*3 - 1.5*/), v)
    );
}

function juliaRender(offset, viewport) {
    var vr = viewport.getRect();

    var buff = new Uint8Array(b.bitmapData.width*b.bitmapData.height*4);

    for (var h = 0; h < b.bitmapData.height; h++) {
	var hp = h/b.bitmapData.height;
	var hInput = vr.height*hp + vr.y;

	for (var w = 0; w < b.bitmapData.width; w++) {
	    var wp = w/b.bitmapData.width;
	    var wInput = vr.width*wp + vr.x;

	    var pixel = new Complex(wInput, hInput);
	    var escaped = undefined;
	    for (var i = 0; i < MAX_ITERATIONS; i++) {
		pixel = pixel.square().add(offset);

		if (pixel.r*pixel.r + pixel.i*pixel.i > JULIA_BOUND) {//!JULIA_BOUNDS.containsPoint(new Point(pixel.r, pixel.i))) {
		    escaped = i;
		    break;
		}
	    }

	    var red, green, blue;
	    if (escaped != undefined) {
		var escapeTime = escaped/MAX_ITERATIONS;
		red = (-Math.cos(escapeTime*Math.PI) + 1)/2*0xff;
		green = Math.sin(escapeTime*Math.PI)*0xff;
		blue = (Math.cos(escapeTime*Math.PI) + 1)/2*0xff;
	    } else {
		red = green = blue = 0x00;
	    }

	    buff.set([red, green, blue, 0xff], (h*b.bitmapData.width + w)*4);
	}
    }
    return buff;
}
