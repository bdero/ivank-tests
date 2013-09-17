var stage, mouseParts;
var sprayParts = false;
var gravity = 0.9;

function start() {
    stage = new Stage('c');
    mouseParts = new Sprite();
    stage.addChild(mouseParts);

    stage.addEventListener(MouseEvent.MOUSE_DOWN, startSpray);
    stage.addEventListener(MouseEvent.MOUSE_UP, stopSpray);
    stage.addEventListener(Event.ENTER_FRAME, updateParticles);
}

function startSpray() { sprayParts = true }
function stopSpray() { sprayParts = false }

function addParticles(x, y, n) {
    for (var i = 0; i < n; i++) {
	var particle = new Sprite();

	particle.graphics.beginFill(
	    Math.floor(Math.random()*0xaf + 0x50)*0x010000 // red
	    + Math.floor(Math.random()*0x4f)*0x000100, // green
	    Math.random() // alpha
	);
	particle.radius = Math.random()*15 + 20;
	particle.graphics.drawCircle(0, 0, particle.radius);
	particle.graphics.endFill();

	mouseParts.addChild(particle);

	particle.x = x; particle.y = y;
	particle.velX = -2 + Math.random()*4;
	particle.velY = Math.random()*3;
    }
}

function updateParticles() {
    // generation
    if (sprayParts)
	addParticles(stage.mouseX, stage.mouseY, 5);

    // mutation + destruction
    for (var i = 0; i < mouseParts.numChildren; i++) {
	particle = mouseParts.getChildAt(i);

	particle.x += particle.velX;
	particle.y += particle.velY;
	particle.velY += gravity;

	if (particle.y > stage.stageHeight + particle.radius)
	    mouseParts.removeChildAt(i);
    }
}
