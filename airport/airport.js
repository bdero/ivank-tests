Array.prototype.removeObject = function(obj) {
    for (var i = 0; i < this.length; i++)
	if (this[i] === obj) return this.splice(i, 1);

    return null;
};

var stage, airport, background, airplaneData, textFormat, actedText;
var airplanes = [], landing = [], takingoff = [], acted = 0;

var timestamp, FRAME_GOAL = 1000/60;
var previousTotalTime, totalTime = 0;

var AIR_Y = 100, LAND_Y = 315, WAIT_X = 430;

var runwayTimer = 0;

function start() {
    textFormat = new TextFormat("sans", 16, 0xddddff, true, false, TextFormatAlign.CENTER);

    stage = new Stage('c');

    airport = new Sprite();
    stage.addChild(airport);

    background = new Bitmap(new BitmapData('img/background.png'));
    airport.addChild(background);

    airplaneData = new BitmapData('img/plane.png');
    // Crappy hack skipping around a problem in (I think) IvanK that causes everything to flicker
    // when loading/unloading WebGL textures (which I think happens upon drawing BitmapData not
    // presently attached to anything).
    stage.addChild(function() {
	var a = new Bitmap(airplaneData);
	a.y = -100;
	return a;
    }());

    actedText = new TextField();
    actedText.setTextFormat(new TextFormat(
	"sans", 20, 0xddddff, false, false, TextFormatAlign.LEFT
    ));
    actedText.width = 400;
    actedText.height = 20;
    actedText.x = actedText.y = 10
    resetActedText();
    stage.addChild(actedText);

    timestamp = Date.now();
    stage.addEventListener(Event.ENTER_FRAME, update);
}

function resetActedText() {
    actedText.text = 'Traffic processed: ' + acted;
}

function update() {
    var ct = Date.now();
    var dt = (ct - timestamp)/FRAME_GOAL;
    timestamp = ct;

    previousTotalTime = totalTime;
    totalTime += dt/60;

    // Scale everything
    airport.scaleX = airport.scaleY = stage.stageHeight/background.bitmapData.height;
    // Center everything
    airport.x = stage.stageWidth/2 - (background.bitmapData.width/2)*airport.scaleX;
    //airport.y = stage.stageHeight/2 - background.bitmapData.height/2;

    var deltaTicks = Math.floor(totalTime*5) - Math.floor(previousTotalTime*5); // 5 ticks/second
    for (var i = 0; i < deltaTicks; i++) {
	// Generate a new plane (15% chance * 5 chances per second)
	if (Math.random() < 0.15) {
	    var isLanding = Math.random() > 0.5;
	    var queueToUse = isLanding ? landing : takingoff;
	    var airplane = new Airplane(
		WAIT_X + airplaneData.width*queueToUse.length,
		isLanding ? AIR_Y : LAND_Y
	    );
	    queueToUse.push(airplane);
	}

	// signal another plane to act (maximum once per second - based on Airplane LANDING_TIME)
	if (!runwayTimer) {
	    var airplane = null;
	    if (landing.length) airplane = landing.shift();
	    else if (takingoff.length) airplane = takingoff.shift();

	    if (airplane) {
		airplane.destinationX = -airplane.bitmap.bitmapData.width;
		airplane.destinationY = LAND_Y;
		runwayTimer = Airplane.prototype.LANDING_TIME;
		updateQueues();
	    }
	} else {
	    runwayTimer--;
	}
    }

    // Graphically update airplanes
    for (var i = 0; i < airplanes.length; i++)
	airplanes[i].update(dt);
}

function updateQueues() {
    var queues = [landing, takingoff];
    for (var i in queues)
	for (var j in queues[i])
	    queues[i][j].destinationX = WAIT_X + airplaneData.width*j;
}

function Airplane(x, y) {
    Sprite.call(this);

    this.bitmap = new Bitmap(airplaneData);
    this.bitmap.x = -this.bitmap.bitmapData.width/2;
    this.bitmap.y = -this.bitmap.bitmapData.height/2;
    this.addChild(this.bitmap);

    this.label = new TextField();
    this.label.setTextFormat(textFormat);
    this.label.x = this.bitmap.x;
    this.label.y = this.bitmap.y - 14;
    this.label.width = this.bitmap.bitmapData.width;
    this.label.height = 12;
    this.label.text = '' + Math.floor(Math.random()*1200);
    this.addChild(this.label);

    this.x = background.bitmapData.width + this.bitmap.bitmapData.width/2
    this.destinationX = x;
    this.destinationY = this.y = y;

    airplanes.push(this);
    airport.addChild(this);
}

Airplane.prototype = new Sprite();
Airplane.prototype.LANDING_TIME = 5;

// Graphically update
Airplane.prototype.update = function(dt) {
    this.x += (this.destinationX - this.x)/20*dt;
    this.y += (this.destinationY - this.y)/10*dt;

    if (this.x < -this.bitmap.bitmapData.width/2) {
	airplanes.removeObject(this);
	airport.removeChild(this);
	acted += 1;
	resetActedText();
    }
};
