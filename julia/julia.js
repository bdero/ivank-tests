// Global variables

var MAX_ITERATIONS = 100;
var JULIA_BOUND = 10*10; // Squared, so we don't have to when rendering

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

// Controller - handles and reacts to input

function Controller() {
    this.drag = false;
    this.dragStart = new Point();
    this.viewportDragStart = new Point();

    stage.addEventListener2(MouseEvent.MOUSE_DOWN, this.mouseDown, this);
    stage.addEventListener2(MouseEvent.MOUSE_UP, this.mouseUp, this);
    stage.addEventListener2(MouseEvent.MOUSE_MOVE, this.mouseMove, this);

    // Add zoom HUD
    var buttonRect = new Rectangle(10, 10, 50, 50);
    var zoomIn = new ZoomButton(buttonRect, 0x999999, true);
    buttonRect.y += zoomIn.height + 10;
    var zoomOut = new ZoomButton(buttonRect, 0x999999, false);

    zoomIn.mouseClick = function() { v.zoom *= 1.5; }
    zoomOut.mouseClick = function() { v.zoom /= 1.5; }
    zoomIn.addEventListener2(MouseEvent.CLICK, zoomIn.mouseClick, zoomIn);
    zoomOut.addEventListener2(MouseEvent.CLICK, zoomOut.mouseClick, zoomOut);

    stage.addChild(zoomIn);
    stage.addChild(zoomOut);
}

Controller.prototype.mouseDown = function(e) {
    if (e.target === b) {
	this.drag = true;

	this.dragStart.setTo(stage.mouseX, stage.mouseY);
	this.viewportDragStart.copyFrom(v.center);
    }
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

// ZoomButton

function ZoomButton(rect, color, zoomIn) {
    Sprite.call(this);
    this.buttonMode = true;
    //this.mouseChildren = false;

    // Set bounds
    this.x = rect.x; this.y = rect.y;
    this.width = rect.width; this.height = rect.height;

    // Background box
    this.graphics.beginFill(color, 0.5);
    this.graphics.drawRoundRect(
	0, 0, rect.width, rect.height, 20, 20
    );
    this.graphics.endFill();

    // Lines
    this.graphics.lineStyle(10, 0xdddddd, 1);
    this.graphics.moveTo(10, rect.height/2);
    this.graphics.lineTo(rect.width - 10, rect.height/2);
    if (zoomIn) {
	this.graphics.moveTo(rect.width/2, 10);
	this.graphics.lineTo(rect.width/2, rect.height - 10);
    }

    // Interaction
    this.mouseOut();
    this.addEventListener2(MouseEvent.MOUSE_OVER, this.mouseOver, this);
    this.addEventListener2(MouseEvent.MOUSE_OUT, this.mouseOut, this);
}

ZoomButton.prototype = new Sprite();

ZoomButton.prototype.mouseOver = function() {
    this.alpha = 1;
}

ZoomButton.prototype.mouseOut = function() {
    this.alpha = 0.6;
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

Complex.prototype.squareAdd = function(other) {
    this.set(
	this.r*this.r - this.i*this.i + other.r,
	2*this.r*this.i + other.i
    );
}

// Julia set functions

function updateJulia() {
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
	    var escaped = null;
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
