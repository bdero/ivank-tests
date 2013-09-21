// Global objects

var stage;

// Entry point

function start() {
    stage = new Stage('c');
    
}

// Misc functions

function color(r, g, b) { return ((r << 8) + g << 8) + b }

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
    this.size = size;
}

Disk.prototype.isBigger = function(other) {
    return this.size > other.size;
}

// Peg - holds a stack of disks

function Peg() {
    this.stack = new Array();
}

Peg.prototype.push = function(disk) {
    if (this.stack.contains(disk))
	console.log("DISK PLACEMENT ERROR: Duplicate disk placed on peg");
    if (disk.isBigger(this.stack.last()))
	console.log("DISK PLACEMENT ERROR: Disk being placed on peg is larger than the current top disk");

    this.stack.push(disk);
}

Peg.prototype.pop = function() {
    return this.stack.pop();
}

// Hanoi - holds three pegs and shifts disks between them

function Hanoi() {
    this.pegs = [];

    for (var i = 0; i < 3; i++)
	this.pegs[i] = new Peg();

    for (var i = 5; i > 0; i--)
	this.pegs[0].push(new Disk(i))
}

Hanoi.prototype.moveDisk = function(source, destination) {
    if (!this.pegs[source].length) {
	console.log("DISK MOVE ERROR: Source peg `" + source + "` doesn't have any disks");
	return false;
    }

    this.pegs[destination].push(this.pegs[source].pop());
}
