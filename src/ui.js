let mouseClicked = false;
let commandClicked = false;
let buttons;

function buttonController(assetType)
{
    switch (assetType) {
        case AssetType.HYDROGEN:
            buttons.namedItem("H").style.backgroundColor = "red";
            buttons.namedItem("He").style.backgroundColor = "#1199EE";
            buttons.namedItem("C").style.backgroundColor = "#1199EE";
            buttons.namedItem("O").style.backgroundColor = "#1199EE";
            break;
        case AssetType.HELIUM:
            buttons.namedItem("He").style.backgroundColor = "red";
            buttons.namedItem("C").style.backgroundColor = "#1199EE";
            buttons.namedItem("O").style.backgroundColor = "#1199EE";
            buttons.namedItem("H").style.backgroundColor = "#1199EE";
            break;
        case AssetType.CARBON:
            buttons.namedItem("C").style.backgroundColor = "red";
            buttons.namedItem("O").style.backgroundColor = "#1199EE";
            buttons.namedItem("H").style.backgroundColor = "#1199EE";
            buttons.namedItem("He").style.backgroundColor = "#1199EE";
            break;
        case AssetType.OXYGEN:
            buttons.namedItem("O").style.backgroundColor = "red";
            buttons.namedItem("He").style.backgroundColor = "#1199EE";
            buttons.namedItem("C").style.backgroundColor = "#1199EE";
            buttons.namedItem("H").style.backgroundColor = "#1199EE";
            break;
    }

    setAtom(assetType);
}

function setCamera(code)
{
    switch (code)
    {
        case 'x':
            camera.viewFromX();
            buttons.namedItem("axis_x").style.backgroundColor = "red";
            buttons.namedItem("axis_y").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_z").style.backgroundColor = "#1199EE";
            break;
        case 'y':
            camera.viewFromY();
            buttons.namedItem("axis_x").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_y").style.backgroundColor = "red";
            buttons.namedItem("axis_z").style.backgroundColor = "#1199EE";
            break;
        case 'z':
        default:
            camera.viewFromZ();
            buttons.namedItem("axis_x").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_y").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_z").style.backgroundColor = "red";
            break;
    }
}

function keyDown(e) {
    if (e.keyCode === 91 || e.keyCode === 17) {  // command or control
        commandClicked = true;
    }
}

function keyUp(e){
    let actual = objectsToRender[0];

    if (e.keyCode === 38 || e.keyCode === 37) {  // Up or Left arrow
        if (actual.assetType > AssetType.HYDROGEN) setAtom(actual.assetType-1);
    }
    if (e.keyCode === 40 || e.keyCode === 39) {  // Down or Right arrow
        if (actual.assetType < AssetType.OXYGEN) setAtom(actual.assetType+1);
    }

    if (e.keyCode === 87) {  // w
        camera.moveForward(1.0);
    }
    if (e.keyCode === 83) {  // s
        camera.moveBack(1.0);
    }

    if (e.keyCode === 91 || e.keyCode === 17) {  // command or control
        commandClicked = false;
    }

    if (e.keyCode === 88) {  // x
        camera.viewFromX();
        //actual.parent.resetPosition();
    }

    if (e.keyCode === 89) {  // y
        camera.viewFromY();
        //actual.parent.resetPosition();
    }

    if (e.keyCode === 90) {  // z
        camera.viewFromZ();
        //actual.parent.resetPosition();
    }

    if (e.keyCode === 82) {  // r
        actual.parent.resetPosition();
    }

}

function mouseMove(e) {
    if (mouseClicked) {
        if (commandClicked) {
            atomOrbit.localCords.x += e.movementX/100;
            atomOrbit.localCords.y -= e.movementY/100;
        } else {
            atomOrbit.localCords.rx += e.movementX;
            atomOrbit.localCords.ry += e.movementY;
        }
    }
}

function setUpUI() {
    init();

    buttons = document.getElementsByClassName("pushy__btn pushy__btn--sm pushy__btn--blue");
    buttons.namedItem("H").style.backgroundColor = "red";
    buttons.namedItem("axis_z").style.backgroundColor = "red";
}

window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);
window.onmousedown = () => {mouseClicked = true};
window.onmouseup = () => {mouseClicked = false};
window.onmousemove = mouseMove;
window.onload = setUpUI;

