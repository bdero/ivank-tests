// Global variables

var MAX_ITERATIONS = 150;
var JULIA_BOUND = 15*15; // Squared, so we don't have to when rendering

var stage, b, v, c, renderer;
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
    renderer = new Renderer(20);

    // Add event listeners for updating
    stage.addEventListener(Event.RESIZE, resetStageBitmap);
    stage.addEventListener2(Event.ENTER_FRAME, renderer.render, renderer);
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
    var size = 50, space = 10, col = 0x999999;
    stage.addChild(new Button(
	new Rectangle(space, space, size, size), col,
	function() { v.zoom *= 1.5 }, true
    ));
    stage.addChild(new Button(
	new Rectangle(space, space*2 + size, size, size), col,
	function() { v.zoom /= 1.5 }, false
    ));
    stage.addChild(new Button(
	new Rectangle(space*2 + size, space, 2*size, size), col,
	function() { renderer.randomOffset() }, null, "Random"
    ));
    stage.addChild(new Button(
	new Rectangle(space*2 + size, space*2 + size, 2*size, size), col,
	function() { v.reset() }, null, "Reset"
    ));
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

// Button

function Button(rect, color, mouseClickAction = null, zoomIn = null, buttonText = null) {
    Sprite.call(this);
    this.buttonMode = true;

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
    if (zoomIn != null) {
	this.graphics.lineStyle(10, 0xdddddd, 1);
	this.graphics.moveTo(10, rect.height/2);
	this.graphics.lineTo(rect.width - 10, rect.height/2);
	if (zoomIn) {
	    this.graphics.moveTo(rect.width/2, 10);
	    this.graphics.lineTo(rect.width/2, rect.height - 10);
	}
    }

    // Text
    if (buttonText != null) {
	this.text = new TextField()
	this.text.setTextFormat(new TextFormat(
	    "sans", 20, 0xdddddd, true, false, null, null
	));
	this.text.text = buttonText;
	this.text.x = this.width/2 - this.text.textWidth/2;
	this.text.y = this.height/2 - this.text.textHeight/2 + 4;
	this.addChild(this.text);
    }

    // Interaction
    this.mouseOut();
    this.addEventListener2(MouseEvent.MOUSE_OVER, this.mouseOver, this);
    this.addEventListener2(MouseEvent.MOUSE_OUT, this.mouseOut, this);
    if (mouseClickAction) this.setMouseClick(mouseClickAction);
}

Button.prototype = new Sprite();

Button.prototype.mouseOver = function() {
    this.alpha = 1;
}

Button.prototype.mouseOut = function() {
    this.alpha = 0.6;
}

Button.prototype.setMouseClick = function(action) {
    this.mouseClick = action;
    this.removeEventListener(MouseEvent.CLICK);
    this.addEventListener2(MouseEvent.CLICK, this.mouseClick, this);
}

// Viewport

function Viewport(center, zoom) {
    this.startCenter = center;
    this.startZoom = zoom;
    this.reset();
}

Viewport.DEFAULT_SIZE = new Point(4, 4);

Viewport.prototype.reset = function() {
    this.center = this.startCenter.clone();
    this.zoom = this.startZoom;
}

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

// Complex - complex number representation for arithmetic

function Complex(r = 0, i = 0) {
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

// Renderer

function Renderer(maxTime) {
    this.startHeight = 0;
    this.maxTime = maxTime; // Milliseconds
    this.randomOffset();
}

Renderer.prototype.randomOffset = function() {
    var randomBound = function() { return Math.random()*2 - 1 }
    this.offset = new Complex(randomBound(), randomBound());
}

Renderer.prototype.render = function() {
    if (this.startHeight >= b.bitmapData.height) this.startHeight = 0;

    var buff = juliaRender(this.startHeight, this.maxTime, this.offset, v);
    var deltaHeight = buff.length/4/b.bitmapData.width;

    if (deltaHeight%1 != 0) return; // The width of the b.bitmapData changed

    var renderRect = new Rectangle(
	0, this.startHeight, b.bitmapData.width, deltaHeight
    );
    b.bitmapData.setPixels(renderRect, buff, v);

    this.startHeight = (this.startHeight + deltaHeight)%b.bitmapData.height;
}

// Julia set functions
function juliaRender(startHeight, maxTime, offset, viewport) {
    var startTime = Date.now();
    var vr = viewport.getRect();

    // Set up the buffer
    var data = new ArrayBuffer(
	b.bitmapData.width*(b.bitmapData.height - startHeight)*4
    );
    var img = new Uint32Array(data); // ArrayBuffer view used to set pixels
    var pixel = new Complex();

    // Loop through each pixel in the buffer
    var h, wInput, hInput, escaped;
    for (h = startHeight; h < b.bitmapData.height; h++) { // Rows
	// Check if we're at or exceeding the maxTime
	if (Date.now() - startTime >= maxTime) break;

	hInput = vr.height*(h/b.bitmapData.height) + vr.y;

	for (var w = 0; w < b.bitmapData.width; w++) { // Columns
	    wInput = vr.width*(w/b.bitmapData.width) + vr.x;

	    // Figure out if the pixel escapes and how many iterations it takes
	    pixel.set(wInput, hInput);
	    escaped = null;
	    for (var i = 0; i < MAX_ITERATIONS; i++) {
		pixel.squareAdd(offset);

		// Check if the number escaped
		if (pixel.r*pixel.r + pixel.i*pixel.i > JULIA_BOUND) {
		    escaped = i;
		    break;
		}
	    }

	    // Set the resulting color
	    img[(h - startHeight)*b.bitmapData.width + w] =
		escaped == undefined ? 0xff000000 : colors[escaped];
	}
    }

    return new Uint8Array(data, 0, (h - startHeight)*b.bitmapData.width*4);
}
