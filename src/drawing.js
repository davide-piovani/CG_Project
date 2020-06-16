let startTime = (new Date).getTime();
let buttons;

function setAtom(assetType) {
    rootNode = new SceneNode();

    objectsToRender = [];
    lights = [];
    nodesToAnimate = [];

    let asset = assetsData[assetType];

    let floor = new SceneNode(rootNode, AssetType.FLOOR, assetsData[AssetType.FLOOR].defaultCords);
    atomOrbit = new SceneNode(rootNode);
    let atom = new SceneNode(atomOrbit, assetType, asset.defaultCords);

    objectsToRender.push(atom, floor);


    // let electronOrbit = new SceneNode(atomOrbit, null, {x: 0.8, y: 0.05});
    //
    // let electron = new SceneNode(electronOrbit, AssetType.ELECTRON, assetsData[AssetType.ELECTRON].defaultCords);
    // lights.push(electron);
    // objectsToRender.push(electron);
    //
    // let electronOrbit2 = new SceneNode(atomOrbit, null, {x: 1.2, y: 0.15});
    //
    // let electron2 = new SceneNode(electronOrbit2, AssetType.ELECTRON, assetsData[AssetType.ELECTRON].defaultCords);
    // lights.push(electron2);
    // objectsToRender.push(electron2);

    for(let i = 0; i < asset.other.n_el; i++) {
        let electronOrbit = new SceneNode(atomOrbit, null, {x: 1.0});
        electronOrbit.setAnimation(new ElectronAnimation(asset.other.orbit[i], trajectories[i]));
        nodesToAnimate.push(electronOrbit);

        let electron = new SceneNode(electronOrbit, AssetType.ELECTRON, assetsData[AssetType.ELECTRON].defaultCords);
        lights.push(electron);
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
    if (locations.hasOwnProperty("textureLocation")) gl.uniform1i(locations.textureLocation, assetsData[AssetType.TEXTURE].texture);
    if (locations.hasOwnProperty("ambientColorLocation")) gl.uniform4fv(locations.ambientColorLocation, new Float32Array(drawInfo.ambientColor));
    if (locations.hasOwnProperty("ambientLightLocation")) gl.uniform4fv(locations.ambientLightLocation, new Float32Array([ambientLight, ambientLight, ambientLight, 1.0]));
    if (locations.hasOwnProperty("emissionColorLocation")) gl.uniform4fv(locations.emissionColorLocation, new Float32Array(drawInfo.emissionColor));

    if (locations.hasOwnProperty("lightTargetLocation")) gl.uniform1f(locations.lightTargetLocation, assetsData[AssetType.ELECTRON].drawInfo.lightInfo.g);
    if (locations.hasOwnProperty("lightDecayLocation")) gl.uniform1f(locations.lightDecayLocation, assetsData[AssetType.ELECTRON].drawInfo.lightInfo.decay);

    if (locations.hasOwnProperty("electronRadiusLocation")) gl.uniform1f(locations.electronRadiusLocation, assetsData[AssetType.ELECTRON].other.asset_radius);
}

function drawScene() {
    animate();

    eraseCanvas();
    rootNode.updateWorldMatrix();

    objectsToRender.forEach((sceneNode) => {
        let worldViewMatrix = utils.multiplyMatrices(camera.viewMatrix, sceneNode.worldMatrix);
        let wvpMatrix = utils.multiplyMatrices(camera.projectionMatrix, worldViewMatrix);

        let drawInfo = assetsData[sceneNode.assetType].drawInfo;
        let locations = drawInfo.locations;

        gl.useProgram(drawInfo.program);

        gl.uniformMatrix4fv(locations.wvpMatrixLocation, gl.FALSE, utils.transposeMatrix(wvpMatrix));

        if (locations.hasOwnProperty("lightPositionLocation") && locations.hasOwnProperty("lightColorLocation")) {
            let inverseObjectMatrix = utils.invertMatrix(sceneNode.worldMatrix);
            let electronLightColor = assetsData[AssetType.ELECTRON].drawInfo.lightInfo.color;
            let lightPos = [];
            let lightCol = [];

            for(let i = 0; i < 8; i++){
                if (lights[i]) {
                    let lightObjectCords = lights[i].getCordsInObjectSpace(inverseObjectMatrix);
                    lightPos.push(lightObjectCords[0], lightObjectCords[1], lightObjectCords[2]);
                    lightCol.push(electronLightColor[0], electronLightColor[1], electronLightColor[2], electronLightColor[3]);
                } else {
                    lightPos.push(0.0, 0.0, 0.0);
                    lightCol.push(0.0, 0.0, 0.0, 0.0);
                }
            }

            gl.uniform3fv(locations.lightPositionLocation, new Float32Array(lightPos));
            gl.uniform4fv(locations.lightColorLocation, new Float32Array(lightCol));
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

function main() {
    camera.updateViewMatrix();
    camera.updateProjectionMatrix();
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

    assetsData[AssetType.ELECTRON].other.asset_radius *= assetsData[AssetType.ELECTRON].defaultCords.s;

    setAtom(AssetType.HYDROGEN);

    main();
}

window.onload = init;
window.onresize = resizeCanvas;