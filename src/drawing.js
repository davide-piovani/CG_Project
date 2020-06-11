let lastAssetType;
let startTime = (new Date).getTime();
let mouseClicked = false;
let commandClicked = false;
let buttons;

function addObjectToScene(params) {
    let obj = new SceneObject();
    obj.setParams(params);
    sceneObjects.push(obj);
}

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
        default: case 'x':
            camera.viewFromX();
            calculateMatrices();
            buttons.namedItem("axis_x").style.backgroundColor = "red";
            buttons.namedItem("axis_y").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_z").style.backgroundColor = "#1199EE";
            break;
        case 'y':
            camera.viewFromY();
            calculateMatrices();
            buttons.namedItem("axis_x").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_y").style.backgroundColor = "red";
            buttons.namedItem("axis_z").style.backgroundColor = "#1199EE";
            break;
        case 'z':
            camera.viewFromZ();
            calculateMatrices();
            buttons.namedItem("axis_x").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_y").style.backgroundColor = "#1199EE";
            buttons.namedItem("axis_z").style.backgroundColor = "red";
            break;
    }
}

function setAtom(assetType) {
    sceneObjects = [];

    let asset = assets[assetType];

    addObjectToScene({assetType: assetType});
    let atom = sceneObjects[0];
    addObjectToScene({assetType: AssetType.FLOOR, parent: atom});

    for(let i = 0; i < asset.n_el; i++) {
        let animation = new AtomAnimation(asset.orbit[i], trajectories[i]);
        addObjectToScene({assetType: AssetType.ELECTRON, animation: animation, parent: atom});
    }
}

async function getAsset(path) {
    let objStr = await utils.get_objstr(path);
    let objModel = new OBJ.Mesh(objStr);

    return {
        vertices: objModel.vertices,
        normals: objModel.vertexNormals,
        indices: objModel.indices,
        textures: objModel.textures
    }
}

async function loadAssets() {
    let electronPath = paths.assets + "/E/electron.obj";
    let carbonPath = paths.assets + "/C/nucleusC.obj";
    let hydrogenPath = paths.assets + "/H/nucleusH.obj";
    let heliumPath = paths.assets + "/He/nucleusHe.obj";
    let oxygenPath = paths.assets + "/O/nucleusO.obj";

    assets[AssetType.ELECTRON].assetInfo = await getAsset(electronPath);
    assets[AssetType.HYDROGEN].assetInfo = await getAsset(hydrogenPath);
    assets[AssetType.HELIUM].assetInfo = await getAsset(heliumPath);
    assets[AssetType.CARBON].assetInfo = await getAsset(carbonPath);
    assets[AssetType.OXYGEN].assetInfo = await getAsset(oxygenPath);
}

function loadAttribAndUniformsLocations() {
    locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    locations.uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
    locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
    locations.textureLocation = gl.getUniformLocation(program, "u_texture");
}

function calculateMatrices() {
    matrices.projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
    matrices.viewMatrix = camera.getViewMatrix();
}

function passAssetsDataToShaders(assetType) {
    if (lastAssetType === assetType) return;
    lastAssetType = assetType;
    let assetInfo = assets[assetType].assetInfo;
    loadArrayBuffer(new Float32Array(assetInfo.vertices), locations.positionAttributeLocation, 3);
    loadArrayBuffer(new Float32Array(assetInfo.textures), locations.uvAttributeLocation, 2);
    loadIndexBuffer(new Uint16Array(assetInfo.indices));
}

function animate(){
    let currentTime = (new Date).getTime();
    let elapsedTime = currentTime - startTime;

    sceneObjects.forEach((sceneObject) => {
        if (sceneObject.animation != null) {
            let params = sceneObject.animation.getPosAtTime(elapsedTime);
            sceneObject.setParams({geometry: params});
        }
    })
}

function drawScene() {
    animate();

    eraseCanvas();

    sceneObjects.forEach((sceneObject) => {
        let worldMatrix = sceneObject.getWorldMatrix();
        if (sceneObject.parent != null) worldMatrix = utils.multiplyMatrices(sceneObject.parent.getWorldMatrix(), worldMatrix);
        let worldViewMatrix = utils.multiplyMatrices(matrices.viewMatrix, worldMatrix);
        let wvpMatrix = utils.multiplyMatrices(matrices.projectionMatrix, worldViewMatrix);

        passAssetsDataToShaders(sceneObject.assetType);

        gl.uniformMatrix4fv(locations.wvpMatrixLocation, gl.FALSE, utils.transposeMatrix(wvpMatrix));

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(locations.textureLocation, assets[AssetType.TEXTURE]);

        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, assets[sceneObject.assetType].assetInfo.indices.length, gl.UNSIGNED_SHORT, 0 );
    })

    window.requestAnimationFrame(drawScene);
}

function main() {
    calculateMatrices();
    loadAttribAndUniformsLocations();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    drawScene();
}

function setUpUI() {
    buttons = document.getElementsByClassName("pushy__btn pushy__btn--sm pushy__btn--blue");
    buttons.namedItem("H").style.backgroundColor = "red";
    buttons.namedItem("axis_z").style.backgroundColor = "red";
}

async function init() {

    setUpUI();

    setUpCanvas();

    initializePaths();
    await loadProgram();

    await loadAssets();
    loadTexture();

    setAtom(AssetType.HYDROGEN);


    main();
}

function resize() {
    resizeCanvas();
    calculateMatrices();
}

function keyDown(e) {
    if (e.keyCode === 91 || e.keyCode === 17) {  // command or control
        commandClicked = true;
    }
}

function keyUp(e){
    if (e.keyCode === 38 || e.keyCode === 37) {  // Up or Left arrow
        let actual = sceneObjects[0].assetType;
        if (actual > AssetType.HYDROGEN) setAtom(actual-1);
    }
    if (e.keyCode === 40 || e.keyCode === 39) {  // Down or Right arrow
        let actual = sceneObjects[0].assetType;
        if (actual < AssetType.OXYGEN) setAtom(actual+1);
    }

    if (e.keyCode === 87) {  // w
        camera.moveForward(1.0);
        calculateMatrices();
    }
    if (e.keyCode === 83) {  // s
        camera.moveBack(1.0);
        calculateMatrices();
    }

    if (e.keyCode === 91 || e.keyCode === 17) {  // command or control
        commandClicked = false;
    }

    if (e.keyCode === 88) {  // z
        camera.viewFromX();
        calculateMatrices();
    }

    if (e.keyCode === 89) {  // z
        camera.viewFromY();
        calculateMatrices();
    }

    if (e.keyCode === 90) {  // z
        camera.viewFromZ();
        calculateMatrices();
    }

}

function mouseMove(e) {
    if (mouseClicked) {
        let obj = sceneObjects[0];
        if (commandClicked) {
            obj.x += e.movementX/100;
            obj.y -= e.movementY/100;
        } else {
            obj.rx += e.movementX;
            obj.ry += e.movementY;
        }
    }
}

window.onload = init;
window.onresize = resize;
window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);
window.onmousedown = () => {mouseClicked = true};
window.onmouseup = () => {mouseClicked = false};
window.onmousemove = mouseMove;

