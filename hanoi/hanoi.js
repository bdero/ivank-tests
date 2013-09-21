// Global objects

var stage, hanoi;

// Entry point

function start() {
    stage = new Stage('c');

    hanoi = new Hanoi(5);
    stage.addChild(hanoi);
    centerHanoi();
    stage.addEventListener(Event.RESIZE, centerHanoi);

    hanoi.solve();
    displaySolution(0);
    //hanoi.moveDisk(0, 2);

}

// Misc functions

function color(r, g, b) { return ((r << 8) + g << 8) + b }

function centerHanoi() {
    hanoi.x = stage.stageWidth/2;
    hanoi.y = stage.stageHeight/1.5;
}

function displaySolution(currentMove) {
    hanoi.moveDisk(hanoi.solution[currentMove][0], hanoi.solution[currentMove][1]);

    if (currentMove < hanoi.solution.length - 1)
	setTimeout('displaySolution(' + (currentMove + 1) + ')', 500);
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

function Peg(numDisks) {
    Sprite.call(this);

    this.graphics.beginFill(0x555555, 1);
    this.graphics.drawRect(-20, -(numDisks - 1)*60, 40, numDisks*60);
    this.graphics.endFill();

    this.stack = [];
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

function Hanoi(numDisks) {
    Sprite.call(this);

    this.graphics.beginFill(0x333333, 1);
    this.graphics.drawRect(-450, 60, 900, 50);
    this.graphics.endFill();

    this.pegs = [];

    for (var i = 0; i < 3; i++) {
	var peg = new Peg(numDisks);

	this.pegs[i] = peg;
	this.addChild(peg);

	peg.x = i*300 - 300;
    }

    this.disks = [];

    for (var i = numDisks; i > 0; i--) {
	var disk = new Disk(i);

	this.pegs[0].push(disk);
	this.addChild(disk);
	this.disks.push(disk);

	var startPosition = this.diskDestination(0, -i + numDisks);
	disk.x = startPosition.x;
	disk.y = startPosition.y;
    }
}

Hanoi.prototype = new Sprite();

Hanoi.prototype.moveDisk = function(source, destination) {
    if (!this.pegs[source].stack.length) {
	console.log("DISK MOVE ERROR: Source peg `" + source + "` doesn't have any disks");
	return false;
    }

    var disk = this.pegs[source].pop();
    this.pegs[destination].push(disk);

    var moveTo = this.diskDestination(destination, this.pegs[destination].stack.length - 1);
    //Tweener.addTween(disk, {x: moveTo.x, y: moveTo.y, transition: 'easeInOutQuad', time: 0.5});
    Tweener.addTween(disk, {x: disk.x, y: -450, transition: 'easeInOutQuad', time: 0.2});
    Tweener.addTween(disk, {x: moveTo.x, y: -450, transition: 'easeInOutQuad', delay: 0.2, time: 0.3});
    Tweener.addTween(disk, {x: moveTo.x, y: moveTo.y, transition: 'easeInOutQuad', delay: 0.5, time: 0.2});
}

Hanoi.prototype.diskDestination = function(peg, level) {
    return {x: this.pegs[peg].x, y: -level*60}
}

Hanoi.prototype.solve = function() {
    var pegs = [];
    for (var i = 0; i < 3; i++)
	pegs[i] = [];

    for (var i = this.pegs[0].stack.length; i > 0; i--)
	pegs[0].push(i);

    this.solution = [];
    this.generateSolution(pegs, this.solution, pegs[0].length, 0, 2);
    console.log(this.solution);
}

Hanoi.prototype.generateSolution = function(pegs, solution, size, source, destination) {
    // Find the transfer
    var transfer;

    var eq = function(_a, _b, _c) { return _a == _c || _b == _c }
    var eq2 = function(_a, _b, _c, _d) { return eq(_a, _b, _c) && eq(_a, _b, _d) }

    if (eq2(source, destination, 0, 1)) transfer = 2;
    else if (eq2(source, destination, 0, 2)) transfer = 1;
    else transfer = 0;

    // Find the current disk
    var diskIndex;
    for (var i = 0; i < pegs[source].length; i++)
	if (size == pegs[source][i])
	    diskIndex = i;

    if (diskIndex == undefined) {
	console.log("SOLVE ERROR: Disk of size `" + size + "` isn't in the source peg `" + source + "`");
	return false;
    }

    // Solve

    // If there are other disks on top of the current disk, move them to the transfer
    var transferSize;
    if (diskIndex < pegs[source].length - 1) {
	transferSize = pegs[source][diskIndex + 1];
	this.generateSolution(pegs, solution, transferSize, source, transfer);
    }

    // The current disk must now be on top; move it to its destination
    pegs[destination].push(pegs[source].pop());
    // Record the move
    solution.push([source, destination]);

    // If we transferred disks on top of the current disk, move them to the destination
    if (transferSize)
	this.generateSolution(pegs, solution, transferSize, transfer, destination);
}
