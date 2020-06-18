let mouseClicked = false;
let commandClicked = false;
let buttons;
let axis_container;
let left_block_container, right_block_container;
let raycast_button;
let floor_button;
let no_diffuse_light_button, lambert_diffuse_button, oren_neyar_diffuse_button;
let no_specular_button, phong_specular_button, blinn_specular_button;
let sigma, sigma_container;
let g_slider, decay_slider;

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
            camera.setMode(camera.Mode.INSIDE);
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
            camera.setMode(camera.Mode.OUTSIDE);
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
        rayCastingActive = 0.0;
        // DEACTIVATE RAYCAST
    }
    else
    {
        raycast_button.innerText = "Active";
        raycast_button.style.backgroundColor = "red";
        rayCastingActive = 1.0;
        // ACTIVATE RAYCAST
    }
}

function toggleFloorUI() {
    if(floor_button.innerText === "Active")
    {
        floor_button.innerText = "Not active";
        floor_button.style.backgroundColor = "#1199EE";
        toggleFloor();
        // DEACTIVATE FLOOR
    }
    else
    {
        floor_button.innerText = "Active";
        floor_button.style.backgroundColor = "red";
        toggleFloor();
        // ACTIVATE FLOOR
    }
}

function diffuseLightChooser(code)
{
    switch (code)
    {
        case Diffuse.NO:
            no_diffuse_light_button.style.backgroundColor = "red";
            lambert_diffuse_button.style.backgroundColor = "#1199EE";
            oren_neyar_diffuse_button.style.backgroundColor = "#1199EE";
            sigma_container.style.display = "none";
            diffuseMode = Diffuse.NO;
            break;
        case Diffuse.LAMBERT:
            no_diffuse_light_button.style.backgroundColor = "#1199EE";
            lambert_diffuse_button.style.backgroundColor = "red";
            oren_neyar_diffuse_button.style.backgroundColor = "#1199EE";
            sigma_container.style.display = "none";
            diffuseMode = Diffuse.LAMBERT;
            break;
        case Diffuse.OREN_NAYAR:
            no_diffuse_light_button.style.backgroundColor = "#1199EE";
            lambert_diffuse_button.style.backgroundColor = "#1199EE";
            oren_neyar_diffuse_button.style.backgroundColor = "red";
            sigma_container.style.display = "inherit";
            sigma.value = defaultSigma;
            diffuseMode = Diffuse.OREN_NAYAR;
            setSigma(defaultSigma);
            break;
    }
}

function specularChooser(code)
{
    switch (code)
    {
        case Specular.NO:
            no_specular_button.style.backgroundColor = "red";
            phong_specular_button.style.backgroundColor = "#1199EE";
            blinn_specular_button.style.backgroundColor = "#1199EE";
            specularMode = Specular.NO;
            break;
        case Specular.PHONG:
            no_specular_button.style.backgroundColor = "#1199EE";
            phong_specular_button.style.backgroundColor = "red";
            blinn_specular_button.style.backgroundColor = "#1199EE";
            specularMode = Specular.PHONG;
            break;
        case Specular.BLINN:
            no_specular_button.style.backgroundColor = "#1199EE";
            phong_specular_button.style.backgroundColor = "#1199EE";
            blinn_specular_button.style.backgroundColor = "red";
            specularMode = Specular.BLINN;
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

    if (e.keyCode === 38) {  // Up arrow
        camera.rotateUp();
    }
    if (e.keyCode === 40) {  // Down arrow
       camera.rotateDown();
    }

    if (e.keyCode === 37) {  // Left arrow
        camera.rotateLeft();
    }
    if (e.keyCode === 39) {  // Right arrow
        camera.rotateRight();
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

function keyPress(e){
    if (e.keyCode === 119) {  // w
        camera.moveForward();
    }

    if (e.keyCode === 115) {  // s
        camera.moveBackward();
    }

    if (e.keyCode === 97) {  // a
        camera.moveLeft();
    }
    if (e.keyCode === 100) {  // d
        camera.moveRight();
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

function refreshSigmaValue()
{
    setSigma(sigma.value);
}

function refreshElectronValue(code) {
    if(code === 'g')
        assetsData[AssetType.ELECTRON].drawInfo.lightInfo.g = g_slider.value;
    else
        assetsData[AssetType.ELECTRON].drawInfo.lightInfo.decay = decay_slider.value;
}

function setUpUI() {
    init();

    sigma = document.getElementById("sigma");
    sigma_container = document.getElementById("sigma_container");
    let canvas = document.getElementById("canvas");
    canvas.onmousemove = mouseMove;
    buttons = document.getElementsByClassName("pushy__btn pushy__btn--sm pushy__btn--blue");
    buttons.namedItem("H").style.backgroundColor = "red";
    buttons.namedItem("axis_z").style.backgroundColor = "red";
    axis_container = document.getElementById("outer_camera_container");
    buttons.namedItem("outside_camera").style.backgroundColor = "red";
    left_block_container = document.getElementById("left_block_container");
    right_block_container = document.getElementById("right_block_container");
    raycast_button = document.getElementById("toggle_raycasting");
    raycast_button.style.backgroundColor = "red";
    floor_button = document.getElementById("toggle_floor");
    //toggleFloorUI();
    floor_button.style.backgroundColor = "red"
    no_diffuse_light_button = document.getElementById("no_diffuse_light");
    lambert_diffuse_button = document.getElementById("lambert_diffuse_light");
    oren_neyar_diffuse_button = document.getElementById("oren_neyar_diffuse_light");
    diffuseLightChooser(diffuseMode);
    no_specular_button = document.getElementById("no_specular_light");
    phong_specular_button = document.getElementById("phong_specular_light");
    blinn_specular_button = document.getElementById("blinn_specular_light");
    decay_slider = document.getElementById("decay_slider");
    g_slider = document.getElementById("g_slider");
    specularChooser(specularMode);

    g_slider.value = assetsData[AssetType.ELECTRON].drawInfo.lightInfo.g;
    decay_slider.value = assetsData[AssetType.ELECTRON].drawInfo.lightInfo.decay;
    refreshElectronValue('g');
    refreshElectronValue('d');

    left_block_container.style.width = "window.innerWidth-300";
    right_block_container.style.width = "300";
    right_block_container.style.marginLeft = "window.innerWidth - 300 + 20";
}

window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);
window.addEventListener("keypress", keyPress, false);
window.onmousedown = () => {mouseClicked = true};
window.onmouseup = () => {mouseClicked = false};
window.onload = setUpUI;

