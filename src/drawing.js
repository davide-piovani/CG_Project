let startTime = (new Date).getTime();
let buttons;

function setAtom(assetType) {
    rootNode = new SceneNode();
    objectsToRender = [];

    let asset = assetsData[assetType];

    let floor = new SceneNode(AssetType.FLOOR, assetsData[AssetType.FLOOR].defaultCords);
    floor.setParent(rootNode);

    atomOrbit = new SceneNode();
    atomOrbit.setParent(rootNode);

    let atom = new SceneNode(assetType, asset.defaultCords);
    atom.setParent(atomOrbit);

    objectsToRender.push(atom, floor);

    for(let i = 0; i < asset.other.n_el; i++) {
        let electronOrbit = new SceneNode();
        electronOrbit.setParent(atomOrbit);

        let electron = new SceneNode(AssetType.ELECTRON, assetsData[AssetType.ELECTRON].defaultCords);
        electron.setParent(electronOrbit);
        electron.setAnimation(new ElectronAnimation(asset.other.orbit[i], trajectories[i]));

        objectsToRender.push(electron);
    }
}

function animate(){
    let currentTime = (new Date).getTime();
    let elapsedTime = currentTime - startTime;

    objectsToRender.forEach((sceneNode) => {
        if (sceneNode.animation != null) {
            let cords = sceneNode.animation.getPosAtTime(elapsedTime);
            sceneNode.setPosition(cords);
        }
    })
}

function drawScene() {
    animate();

    eraseCanvas();
    rootNode.updateWorldMatrix();

    objectsToRender.forEach((sceneNode) => {
        let worldViewMatrix = utils.multiplyMatrices(camera.viewMatrix, sceneNode.worldMatrix);
        let wvpMatrix = utils.multiplyMatrices(projectionMatrix, worldViewMatrix);

        let drawInfo = assetsData[sceneNode.assetType].drawInfo;
        gl.useProgram(drawInfo.program);

        gl.uniformMatrix4fv(drawInfo.locations.wvpMatrixLocation, gl.FALSE, utils.transposeMatrix(wvpMatrix));
        gl.uniform1i(drawInfo.locations.textureLocation, assetsData[AssetType.TEXTURE].texture);

        gl.bindVertexArray(drawInfo.vao);
        gl.drawElements(gl.TRIANGLES, drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
    })

    window.requestAnimationFrame(drawScene);
}

function main() {
    projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
    loadAttribAndUniformsLocations();
    loadVaos();

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

    await loadPrograms();
    await loadAssetsStruct();
    loadTexture();

    setAtom(AssetType.HYDROGEN);

    main();
}

function resize() {
    resizeCanvas();
    projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
}

window.onload = init;
window.onresize = resize;
