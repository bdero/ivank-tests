var stage, bitmap, simplex, time = 0, xoffset = 0, yoffset = 0;

function start() {
    stage = new Stage('c');
    bitmap = new Bitmap(newBitmapData());
    stage.addChild(bitmap);
    simplex = new SimplexNoise();

    stage.addEventListener(Event.RESIZE, resize);
    stage.addEventListener(Event.ENTER_FRAME, update);
}

function newBitmapData() {
    return BitmapData.empty(stage.stageWidth, stage.stageHeight);
}

function resize() {
    bitmap.bitmapData = newBitmapData();
}

function update() {
    // Modify offsets
    xoffset += (stage.mouseX - stage.stageWidth/2)/stage.stageWidth/2;
    yoffset += (stage.mouseY - stage.stageHeight/2)/stage.stageHeight/2;
    time+= 0.02;

    // Render image
    var data = new ArrayBuffer(
	bitmap.bitmapData.width*bitmap.bitmapData.height*4
    );
    var d32 = new Uint32Array(data);

    var w, h, c;
    for (h = 0; h < bitmap.bitmapData.height; h++) {
	for (w = 0; w < bitmap.bitmapData.width; w++) {
	    c = Math.floor(
		(simplex.noise3d(
		    w/70 + xoffset, h/70 + yoffset, time*2
		) + 1)/2*0x55
	    );
	    d32[h*bitmap.bitmapData.width + w] =
		0xffaa0000 | c | c << 8;
	}
    }

    bitmap.bitmapData.setPixels(bitmap.bitmapData.rect, new Uint8Array(data));
}
