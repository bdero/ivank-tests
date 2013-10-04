var stage, heartData;
var hearts = [];

function start() {
    stage = new Stage('c');
    heartData = new BitmapData('heart.png');

    stage.addEventListener(Event.ENTER_FRAME, update);
}

function update() {
    var spawnNum = Math.floor(Math.random()*20);
    for (var i = 0; i < spawnNum; i++) {
	var h = new Heart();
	hearts.push(h);
	stage.addChild(h);
    }

    var i = 0;
    while (i < hearts.length) {
	hearts[i].update();
	if (hearts[i].living == false) {
	    var h = hearts.splice(i, 1);
	    stage.removeChild(h[0]);
	} else
	    i++;
    }
}

function Heart() {
    Sprite.call(this);

    this.bitmap = new Bitmap(heartData);
    this.bitmap.x = -this.bitmap.bitmapData.width/2;
    this.bitmap.y = -this.bitmap.bitmapData.height/2;
    this.addChild(this.bitmap);

    this.x = Math.random()*stage.stageWidth;
    this.y = -this.bitmap.bitmapData.height/2;
    this.scaleX = this.scaleY = Math.random()*0.5 + 0.5;
    this.rotation = Math.random()*360;

    this.spin = Math.random()*50 - 25;
    this.gravity = Math.random()*4 + 2;
    this.speedX = Math.random()*50 - 25;
    this.speedY = Math.random()*30;

    this.living = true;
}

Heart.prototype = new Sprite();

Heart.prototype.right = function() {
    return this.x + this.bitmap.bitmapData.width/2;
}

Heart.prototype.bottom = function() {
    return this.y + this.bitmap.bitmapData.height/2;
}

Heart.prototype.update = function() {
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.spin;

    if (this.y - this.bitmap.bitmapData.height/2 > stage.stageHeight)
	this.living = false;
}
