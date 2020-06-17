let mouseClicked = false;
let commandClicked = false;
let buttons;
let axis_container;
let left_block_container, right_block_container;
let raycast_button;

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
        case 'in':
            axis_container.style.display = "none";
            // buttons.namedItem("axis_x").display = "none";
            // buttons.namedItem("axis_y").display = "none";
            // buttons.namedItem("axis_z").display = "none";
            buttons.namedItem("outside_camera").style.backgroundColor = "#1199EE";
            buttons.namedItem("inside_camera").style.backgroundColor = "red";
            break;
        case 'out':
            axis_container.style.display = "inherit";
            buttons.namedItem("axis_x").display = "inherit";
            buttons.namedItem("axis_y").display = "inherit";
            buttons.namedItem("axis_z").display = "inherit";
            buttons.namedItem("outside_camera").style.backgroundColor = "red";
            buttons.namedItem("inside_camera").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_x").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_y").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_z").style.backgroundColor = "red";
            camera.viewFromZ();
            break;
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

function toggleRaycast() {
    if(raycast_button.innerText === "Active")
    {
        raycast_button.innerText = "Not active";
        raycast_button.style.backgroundColor = "#1199EE";
        // DEACTIVATE RAYCAST
    }
    else
    {
        raycast_button.innerText = "Active";
        raycast_button.style.backgroundColor = "red";
        // ACTIVATE RAYCAST
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
    axis_container = document.getElementById("outer_camera_container");
    buttons.namedItem("outside_camera").style.backgroundColor = "red";
    left_block_container = document.getElementById("left_block_container");
    right_block_container = document.getElementById("right_block_container");
    raycast_button = document.getElementById("toggle_raycasting");
    raycast_button.style.backgroundColor = "red";

    left_block_container.style.width = "window.innerWidth-300";
    right_block_container.style.width = "300";
    right_block_container.style.marginLeft = "window.innerWidth - 300 + 20";
}

window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);
window.onmousedown = () => {mouseClicked = true};
window.onmouseup = () => {mouseClicked = false};
window.onmousemove = mouseMove;
window.onload = setUpUI;

