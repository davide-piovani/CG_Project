let startTime = (new Date).getTime();
let buttons;

function setAtom(assetType) {
    rootNode = new SceneNode();
    objectsToRender = [];
    nodesToAnimate = [];

    let asset = assetsData[assetType];

    let floor = new SceneNode(AssetType.FLOOR, assetsData[AssetType.FLOOR].defaultCords);
    floor.setParent(rootNode);

    atomOrbit = new SceneNode();
    atomOrbit.setParent(rootNode);

    let atom = new SceneNode(assetType, asset.defaultCords);
    atom.setParent(atomOrbit);

    objectsToRender.push(atom, floor);

    light = new SceneNode(AssetType.LIGHT, assetsData[AssetType.LIGHT].defaultCords);

    for(let i = 0; i < asset.other.n_el; i++) {
        let electronOrbit = new SceneNode();
        electronOrbit.setParent(atomOrbit);
        electronOrbit.setAnimation(new ElectronAnimation(asset.other.orbit[i], trajectories[i]));
        nodesToAnimate.push(electronOrbit);

        let electron = new SceneNode(AssetType.ELECTRON, assetsData[AssetType.ELECTRON].defaultCords);
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

function loadUniforms(assetType, locations) {
    switch (assetType) {
        case AssetType.HYDROGEN:
        case AssetType.HELIUM:
        case AssetType.CARBON:
        case AssetType.OXYGEN:
            gl.uniform1i(locations.textureLocation, assetsData[AssetType.TEXTURE].texture);
            gl.uniform4fv(locations.lightColorLocation, new Float32Array(assetsData[AssetType.LIGHT].color));

            let lightLocalCords = [light.localCords.x, light.localCords.y, light.localCords.z, 1.0];
            let lightWorldCords = utils.multiplyMatrixVector(light.worldMatrix, lightLocalCords);

            gl.uniform3fv(locations.lightPositionLocation, new Float32Array([lightWorldCords[0], lightWorldCords[1], lightWorldCords[2]]));
            gl.uniform1f(locations.lightTargetLocation, assetsData[AssetType.LIGHT].g);
            gl.uniform1f(locations.lightDecayLocation, 1.0/assetsData[AssetType.LIGHT].decay);

            break;

        case AssetType.ELECTRON:
            gl.uniform4fv(locations.difColorLocation, new Float32Array(assetsData[assetType].drawInfo.diffuseColor));
            break;

        case AssetType.FLOOR:
            gl.uniform4fv(locations.difColorLocation, new Float32Array(assetsData[assetType].drawInfo.diffuseColor));
            break;

        default:
            gl.uniform1i(locations.textureLocation, assetsData[AssetType.TEXTURE].texture);
            break;
    }
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
        loadUniforms(sceneNode.assetType, drawInfo.locations);

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
    projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
}

function main() {
    projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
    loadAttribAndUniformsLocations();
    loadVaos();

    console.log("g: " + assetsData[AssetType.LIGHT].g);
    console.log("Decay: " + assetsData[AssetType.LIGHT].decay);
    console.log("Inv: " + 1.0/assetsData[AssetType.LIGHT].decay);

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