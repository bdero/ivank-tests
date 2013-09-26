// Global variables

var MAX_ITERATIONS = 50;
var JULIA_BOUND = 10*10;

var stage, b, v, c;
var colors;

// System functions

function start() {
    // Precompute colors
    generateColors();

    // Set up stage, bitmap, viewport, and controller
    stage = new Stage('c');
    b = new Bitmap(newStageBitmap());
    stage.addChild(b);

    v = new Viewport(new Point(0, 0), 1);
    c = new Controller();
    stage.addChild(c);

    // Add event listeners for updating
    stage.addEventListener(Event.RESIZE, resetStageBitmap);
    stage.addEventListener(Event.ENTER_FRAME, updateJulia);
}

function resetStageBitmap() {
    b.bitmapData = newStageBitmap();
}

function newStageBitmap() {
    return BitmapData.empty(stage.stageWidth, stage.stageHeight);
}

function generateColors() {
    colors = new Uint32Array(MAX_ITERATIONS);

    var escapeTime, red, green, blue;
    for (var i = 0; i < colors.length; i++) {
	var escapeTime = i/MAX_ITERATIONS;

	red = (-Math.cos(escapeTime*Math.PI) + 1)/2*0xff;
	green = Math.sin(escapeTime*Math.PI)*0xff;
	blue = (Math.cos(escapeTime*Math.PI) + 1)/2*0xff;

	colors[i] = (0xff000000 | red | green << 8 | blue << 16);
    }
}

// Rectangle extensions (unused)
/*
Rectangle.prototype.left = function() { return this.x }

Rectangle.prototype.right = function() { return this.x + this.width }

Rectangle.prototype.top = function() {return this.y }

Rectangle.prototype.bottom = function() { return this.y + this.height }
*/
// Point extensions (unused)
/*
Point.prototype.difference = function(other) {
    return new Point(
	this.x - other.x, this.y - other.y
    );
}

Point.prototype.addFrom = function(other) {
    this.x += other.x;
    this.y += other.y;
}
*/
// Controller - handles and reacts to input

function Controller() {
    InteractiveObject.call(this);

    this.drag = false;
    this.dragStart = new Point();
    console.log(this.dragStart);
    this.viewportDragStart = new Point();

    stage.addEventListener2(MouseEvent.MOUSE_DOWN, this.mouseDown, this);
    stage.addEventListener2(MouseEvent.MOUSE_UP, this.mouseUp, this);
    stage.addEventListener2(MouseEvent.MOUSE_MOVE, this.mouseMove, this);
}

Controller.prototype = new InteractiveObject();

Controller.prototype.mouseDown = function() {
    this.drag = true;
    console.log(this.dragStart);
    this.dragStart.setTo(stage.mouseX, stage.mouseY);
    this.viewportDragStart.copyFrom(v.center);
}

Controller.prototype.mouseUp = function() {
    this.drag = false;
}

Controller.prototype.mouseMove = function() {
    if (this.drag) {
	var viewportRect = v.getRect();
	var dragRatio = viewportRect.width/stage.stageWidth;
	v.center.setTo(
	    this.viewportDragStart.x
		- (stage.mouseX - this.dragStart.x)*dragRatio,
	    this.viewportDragStart.y
		- (stage.mouseY - this.dragStart.y)*dragRatio
	);
    }
}

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
    this.set(r, i);
}

Complex.prototype.set = function(r, i) {
    this.r = r;
    this.i = i;
}
/*
Complex.prototype.add = function(other) {
    this.r += other.r;
    this.i += other.i;
}

Complex.prototype.multiply = function(other) {
    this.set(
	this.r*other.r - this.i*other.i,
	this.r*other.i + this.i*other.r
    );
}

Complex.prototype.square = function() {
    this.set(
	this.r*this.r - this.i*this.i,
	2*this.r*this.i
    );
}
*/
Complex.prototype.squareAdd = function(other) {
    this.set(
	this.r*this.r - this.i*this.i + other.r,
	2*this.r*this.i + other.i
    );
}

// Julia set functions

function updateJulia() {
    //v.zoom*=1.1;

    b.bitmapData.setPixels(
	b.bitmapData.rect,
	juliaRender(new Complex(-0.835, -0.2321), v)
    );
}

function juliaRender(offset, viewport) {
    var vr = viewport.getRect();

    var data = new ArrayBuffer(b.bitmapData.width*b.bitmapData.height*4);
    var img = new Uint32Array(data); // ArrayBuffer view used to set pixels
    var buff = new Uint8Array(data); // ArrayBuffer view to return

    var pixel = new Complex();

    var wInput, hInput, escaped;
    for (var h = 0; h < b.bitmapData.height; h++) {
	hInput = vr.height*(h/b.bitmapData.height) + vr.y;

	for (var w = 0; w < b.bitmapData.width; w++) {
	    wInput = vr.width*(w/b.bitmapData.width) + vr.x;

	    pixel.set(wInput, hInput);
	    var escaped = undefined;
	    for (var i = 0; i < MAX_ITERATIONS; i++) {
		pixel.squareAdd(offset);

		if (pixel.r*pixel.r + pixel.i*pixel.i > JULIA_BOUND) {
		    escaped = i;
		    break;
		}
	    }

	    img[h*b.bitmapData.width + w] = escaped == undefined ? 0xff000000 : colors[escaped];
	}
    }
    return buff;
}
