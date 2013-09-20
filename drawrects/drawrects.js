var stage, background;

function start() {
    stage = new Stage('c');
    background = new Sprite();
    stage.addChild(background);

    stage.addEventListener(Event.ENTER_FRAME, addRandomRect);
}

function addRandomRect() {
    var size = Math.random()*30;
    background.graphics.beginFill(color(50, 20, 20), Math.random()*0xffffff);
    background.graphics.drawRect(
	Math.random()*(stage.stageWidth - size),
	Math.random()*(stage.stageHeight - size),
	size, size
    );
    background.graphics.endFill();
}

function color(r, g, b) {
    return ((r << 8) + g << 8) + b;
}
