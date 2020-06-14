let startTime = (new Date).getTime();
let buttons;

function setAtom(assetType) {
    rootNode = new SceneNode();
    rootNode.setName("Root");

    objectsToRender = [];
    nodesToAnimate = [];

    let asset = assetsData[assetType];

    let floor = new SceneNode(AssetType.FLOOR, assetsData[AssetType.FLOOR].defaultCords);
    floor.setName("Floor");
    floor.setParent(rootNode);

    atomOrbit = new SceneNode();
    atomOrbit.setName("Atom orbit");
    atomOrbit.setParent(rootNode);

    let atom = new SceneNode(assetType, asset.defaultCords);
    atom.setName("Atom");
    atom.setParent(atomOrbit);

    objectsToRender.push(atom, floor);

    light = new SceneNode(AssetType.LIGHT, assetsData[AssetType.LIGHT].defaultCords);
    light.setName("Light");

    for(let i = 0; i < asset.other.n_el; i++) {
        let electronOrbit = new SceneNode(null, {x: 1.0});
        electronOrbit.setName("Electron orbit");
        electronOrbit.setParent(atomOrbit);
        electronOrbit.setAnimation(new ElectronAnimation(asset.other.orbit[i], trajectories[i]));
        nodesToAnimate.push(electronOrbit);

        let electron = new SceneNode(AssetType.ELECTRON, assetsData[AssetType.ELECTRON].defaultCords);
        electron.setName("Electron");
        electron.setParent(electronOrbit);

        light.setParent(electronOrbit);

        objectsToRender.push(electron);
    }
}

function animate(){
    let currentTime = (new Date).getTime();
    let elapsedTime = currentTime - startTime;

    nodesToAnimate.forEach((sceneNode) => {
        if (sceneNode.animation != null) {
            let cords = sceneNode.animation.getPosAtTime(elapsedTime);
            sceneNode.setPosition(cords);
        }
    })
}

function loadUniforms(drawInfo, locations) {
    let lightAsset = assetsData[AssetType.LIGHT];

    if (locations.hasOwnProperty("textureLocation")) gl.uniform1i(locations.textureLocation, assetsData[AssetType.TEXTURE].texture);
    if (locations.hasOwnProperty("lightColorLocation")) gl.uniform4fv(locations.lightColorLocation, new Float32Array(lightAsset.color));
    if (locations.hasOwnProperty("lightTargetLocation")) gl.uniform1f(locations.lightTargetLocation, lightAsset.g);
    if (locations.hasOwnProperty("lightDecayLocation")) gl.uniform1f(locations.lightDecayLocation, lightAsset.decay);
    if (locations.hasOwnProperty("ambientColorLocation")) gl.uniform4fv(locations.ambientColorLocation, new Float32Array(drawInfo.ambientColor));
    if (locations.hasOwnProperty("ambientLightLocation")) gl.uniform4fv(locations.ambientLightLocation, new Float32Array([ambientLight, ambientLight, ambientLight, 1.0]));
    if (locations.hasOwnProperty("difColorLocation")) gl.uniform4fv(locations.difColorLocation, new Float32Array(drawInfo.diffuseColor));
    if (locations.hasOwnProperty("emissionColorLocation")) gl.uniform4fv(locations.emissionColorLocation, new Float32Array(drawInfo.emissionColor));
}

function drawScene() {
    animate();

    eraseCanvas();
    rootNode.updateWorldMatrix();

    objectsToRender.forEach((sceneNode) => {
        let worldViewMatrix = utils.multiplyMatrices(camera.viewMatrix, sceneNode.worldMatrix);
        let wvpMatrix = utils.multiplyMatrices(projectionMatrix, worldViewMatrix);

        let drawInfo = assetsData[sceneNode.assetType].drawInfo;
        let locations = drawInfo.locations;

        gl.useProgram(drawInfo.program);

        gl.uniformMatrix4fv(locations.wvpMatrixLocation, gl.FALSE, utils.transposeMatrix(wvpMatrix));

        if (locations.hasOwnProperty("lightPositionLocation")) {
            let lightObjectCords = light.getCordsInObjectSpace(sceneNode.worldMatrix);
            gl.uniform3fv(locations.lightPositionLocation, new Float32Array([lightObjectCords[0], lightObjectCords[1], lightObjectCords[2]]));
        }

        loadUniforms(assetsData[sceneNode.assetType].drawInfo, locations);

        gl.bindVertexArray(drawInfo.vao);
        gl.drawElements(gl.TRIANGLES, drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
    })

    window.requestAnimationFrame(drawScene);
}

function setUpUI() {
    buttons = document.getElementsByClassName("pushy__btn pushy__btn--sm pushy__btn--blue");
    buttons.namedItem("H").style.backgroundColor = "red";
    buttons.namedItem("axis_z").style.backgroundColor = "red";
}

function resize() {
    resizeCanvas();
    projectionMatrix = utils.MakeParallel(w, a, n, f);
}

function main() {
    projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
    loadAttribAndUniformsLocations();
    loadVaos();

    drawScene();
}

async function init() {
    setUpUI();
    setUpCanvas();
    initializePaths();

    await loadPrograms();
    await loadAssetsStruct();
    loadTexture();

    setAtom(AssetType.HYDROGEN);

    main();
}

window.onload = init;
window.onresize = resize;