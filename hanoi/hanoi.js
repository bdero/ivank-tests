// Global objects

var stage, hanoi;

// Entry point

function start() {
    stage = new Stage('c');

    hanoi = new Hanoi();
    stage.addChild(hanoi);
    centerHanoi();
    stage.addEventListener(Event.RESIZE, centerHanoi);
}

// Misc functions

function color(r, g, b) { return ((r << 8) + g << 8) + b }

function centerHanoi() {
    hanoi.x = stage.stageWidth/2;
    hanoi.y = stage.stageHeight/1.5;
}

// Array extensions

Array.prototype.contains = function(obj) {
    var i = this.length;
    
    while (i--)
	if (this[i] === obj)
	    return true;

    return false;
}

Array.prototype.last = function() {
    return this[this.length - 1];
}

// Disk

function Disk(size) {
    Sprite.call(this);

    this.graphics.beginFill(Math.random()*0xffffff, 0.7);
    this.graphics.drawRect(-25*size - 20, 0, 50*size + 40, 50);
    this.graphics.endFill();

    this.size = size;
}

Disk.prototype = new Sprite();

Disk.prototype.isBigger = function(other) {
    return this.size > other.size;
}

// Peg - holds a stack of disks

function Peg() {
    Sprite.call(this);

    this.graphics.beginFill(0x555555, 1);
    this.graphics.drawRect(-20, -360, 40, 420);
    this.graphics.endFill();

    this.stack = new Array();
}

Peg.prototype = new Sprite();

Peg.prototype.push = function(disk) {
    if (this.stack.contains(disk))
	console.log("DISK PLACEMENT ERROR: Duplicate disk placed on peg");
    if (this.stack.length > 0 && disk.isBigger(this.stack.last()))
	console.log("DISK PLACEMENT ERROR: Disk being placed on peg is larger than the current top disk");

    this.stack.push(disk);
}

Peg.prototype.pop = function() {
    return this.stack.pop();
}

// Hanoi - holds three pegs and shifts disks between them

function Hanoi() {
    Sprite.call(this);

    this.graphics.beginFill(0x333333, 1);
    this.graphics.drawRect(-450, 60, 900, 50);
    this.graphics.endFill();

    this.pegs = [];

    for (var i = 0; i < 3; i++) {
	var peg = new Peg();

	this.pegs[i] = peg;
	this.addChild(peg);

	peg.x = i*300 - 300;
    }

    for (var i = 5; i > 0; i--) {
	var disk = new Disk(i);

	this.pegs[0].push(new Disk(i));
	this.addChild(disk);

	var startPosition = this.diskDestination(0, -i + 5);
	disk.x = startPosition.x;
	disk.y = startPosition.y;
    }
}

Hanoi.prototype = new Sprite();

Hanoi.prototype.moveDisk = function(source, destination) {
    if (!this.pegs[source].length) {
	console.log("DISK MOVE ERROR: Source peg `" + source + "` doesn't have any disks");
	return false;
    }

    var sourcePeg = this.pegs[source].pop();
    this.pegs[destination].push(sourcePeg);

    var moveTo = this.diskDestination(destination, this.pegs[destination].length - 1);
    Tweener.addTween(sourcePeg, {x: moveTo.x, y: moveTo.y, transition: 'easeInOutQuad', time: 1});
}

Hanoi.prototype.diskDestination = function(peg, level) {
    return {x: this.pegs[peg].x, y: -level*60}
}
