var stage, bitmap, simplex, time = 0, xoffset = 0, yoffset = 0, useMouse = false;
var colors = [], MAX_COLORS = 15;

function start() {
    stage = new Stage('c');
    bitmap = new Bitmap(newBitmapData());
    stage.addChild(bitmap);
    simplex = new SimplexNoise();

    generateColors();

    stage.addEventListener(Event.RESIZE, resize);
    stage.addEventListener(Event.ENTER_FRAME, update);
    stage.addEventListener(MouseEvent.MOUSE_DOWN, mDown);
    stage.addEventListener(MouseEvent.MOUSE_UP, mUp);
}

function generateColors() {
    colors = new Uint32Array(MAX_COLORS);

    var weight, red, green, blue;
    for (var i = 0; i < colors.length; i++) {
	weight = i/MAX_COLORS;

	red = (-Math.cos(weight*Math.PI) + 1)/2*0xff;
	green = Math.sin(weight*Math.PI)*0xff;
	blue = (Math.cos(weight*Math.PI) + 1)/2*0xff;

	colors[i] = (0xff000000 | red | green << 8 | blue << 16);
    }

    console.log(colors);
}


function newBitmapData() {
    return BitmapData.empty(stage.stageWidth, stage.stageHeight);
}

function mDown() {
    useMouse = true;
}

function mUp() {
    useMouse = false;
}

function resize() {
    bitmap.bitmapData = newBitmapData();
}

function update() {
    // Modify offsets
    time += 1;

    if (useMouse) {
	xoffset += (stage.mouseX - stage.stageWidth/2)/stage.stageWidth/2;
	yoffset += (stage.mouseY - stage.stageHeight/2)/stage.stageHeight/2;
    } else {
	xoffset += Math.sin(time/200)/10;
	yoffset += Math.cos(time/200)/10;
    }

    // Render image
    var data = new ArrayBuffer(
	bitmap.bitmapData.width*bitmap.bitmapData.height*4
    );
    var d32 = new Uint32Array(data);

    var w, h, c;
    for (h = 0; h < bitmap.bitmapData.height; h++) {
	for (w = 0; w < bitmap.bitmapData.width; w++) {
	    c = (simplex.noise3d(w/70 + xoffset, h/70 + yoffset, time/35) + 1)/2;
	    d32[h*bitmap.bitmapData.width + w] = colors[Math.floor(c*MAX_COLORS)];
	}
    }

    bitmap.bitmapData.setPixels(bitmap.bitmapData.rect, new Uint8Array(data));
}
