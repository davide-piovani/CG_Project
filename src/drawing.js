let startTime = (new Date).getTime();

function setAtom(assetType) {
    rootNode = new SceneNode();

    objectsToRender = [];
    lights = [];
    nodesToAnimate = [];

    let asset = assetsData[assetType];

    atomOrbit = new SceneNode(rootNode);
    atom = new SceneNode(atomOrbit, assetType, asset.defaultCords);

    objectsToRender.push(atom);
    toggleFloor();


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
    // Object params
    if (locations.hasOwnProperty("textureLocation")) gl.uniform1i(locations.textureLocation, assetsData[AssetType.TEXTURE].texture);
    if (locations.hasOwnProperty("ambientColorLocation")) gl.uniform4fv(locations.ambientColorLocation, new Float32Array(drawInfo.ambientColor));
    if (locations.hasOwnProperty("emissionColorLocation")) gl.uniform4fv(locations.emissionColorLocation, new Float32Array(drawInfo.emissionColor));

    // Lights params
    if (locations.hasOwnProperty("ambientLightLocation")) gl.uniform4fv(locations.ambientLightLocation, new Float32Array([ambientLight, ambientLight, ambientLight, 1.0]));
    if (locations.hasOwnProperty("lightTargetLocation")) gl.uniform1f(locations.lightTargetLocation, assetsData[AssetType.ELECTRON].drawInfo.lightInfo.g);
    if (locations.hasOwnProperty("lightDecayLocation")) gl.uniform1f(locations.lightDecayLocation, assetsData[AssetType.ELECTRON].drawInfo.lightInfo.decay);

    // Raycasting params
    if (locations.hasOwnProperty("electronRadiusLocation")) gl.uniform1f(locations.electronRadiusLocation, assetsData[AssetType.ELECTRON].other.asset_radius);
    if (locations.hasOwnProperty("rayCastingLocation")) gl.uniform1f(locations.rayCastingLocation, rayCastingActive);

    // BRDF
    if (locations.hasOwnProperty("diffuseModeLocation")) gl.uniform1f(locations.diffuseModeLocation, diffuseMode);
    if (locations.hasOwnProperty("specularModeLocation")) gl.uniform1f(locations.specularModeLocation, specularMode);
    if (locations.hasOwnProperty("specShineLocation")) gl.uniform1f(locations.specShineLocation, drawInfo.specShine);
    if (locations.hasOwnProperty("sigmaLocation")) gl.uniform1f(locations.sigmaLocation, drawInfo.sigma*drawInfo.sigma);
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

        let inverseWorldMatrix = utils.invertMatrix(sceneNode.worldMatrix);
        let inverseViewMatrix = utils.invertMatrix(camera.viewMatrix);

        if (locations.hasOwnProperty("lightPositionLocation") && locations.hasOwnProperty("lightColorLocation")) {
            let inverseObjectMatrix = inverseWorldMatrix;
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

        if (locations.hasOwnProperty("eyePosLocation")) {
            let eyePos = camera.getWorldPosition();
            let matrix = utils.MakeScaleMatrix(1/0.2);
            let objectEyePos = utils.multiplyMatrixVector(matrix, eyePos);
            gl.uniform3fv(locations.eyePosLocation, new Float32Array([objectEyePos[0], objectEyePos[1], objectEyePos[2]]));
        }

        loadUniforms(assetsData[sceneNode.assetType].drawInfo, locations);

        gl.bindVertexArray(drawInfo.vao);
        gl.drawElements(gl.TRIANGLES, drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
    })

    window.requestAnimationFrame(drawScene);
}

function main() {
    camera.updateViewMatrix();
    camera.updateProjectionMatrix();
    loadAttribAndUniformsLocations();
    loadVaos();

    drawScene();
}

async function init() {
    setUpCanvas();
    initializePaths();

    await loadPrograms();
    await loadAssetsStruct();
    loadTexture();

    //assetsData[AssetType.ELECTRON].other.asset_radius *= assetsData[AssetType.ELECTRON].defaultCords.s;

    setAtom(AssetType.HYDROGEN);

    main();
}

window.onresize = resizeCanvas

function cameraOutsideInside() {
    let cameraPos = camera.getWorldPosition();
    if (cameraPos[0] === 0.0 && cameraPos[1] === 0.0 && cameraPos[2] === 0.0) {
        camera.viewFromZ();
        objectsToRender.unshift(atom);
    } else {
        camera.setPosition({x: 0.0, y: 0.0, z: 0.0});
        objectsToRender.splice(0, 1);
    }
}

function changeAmbientLight(value) {
    if (value >= 0.0 && value <= 1.0) ambientLight = value;
}

function toggleFloor() {
    let floor = null;
    let index;

    for(index = 0; index < objectsToRender.length; index++){
        if (objectsToRender[index].assetType === AssetType.FLOOR) {
            floor = objectsToRender[index];
            break;
        }
    }

    if (floor) {
        objectsToRender.splice(index, 1);
    } else {
        objectsToRender.push(new SceneNode(rootNode, AssetType.FLOOR, assetsData[AssetType.FLOOR].defaultCords));
    }
}

function setElectronLightTarget(value) {
    assetsData[AssetType.ELECTRON].drawInfo.lightInfo.g = value;
}

function setElectronLightDecay(value) {
    assetsData[AssetType.ELECTRON].drawInfo.lightInfo.decay = value;
}

function setSpecShine(value) {
    let types = [AssetType.HYDROGEN, AssetType.HELIUM, AssetType.CARBON, AssetType.OXYGEN];
    for(let type of types) assetsData[type].drawInfo.specShine = value;
}

function setSigma(value) {
    let types = [AssetType.HYDROGEN, AssetType.HELIUM, AssetType.CARBON, AssetType.OXYGEN];
    for(let type of types) assetsData[type].drawInfo.sigma = value;
}

function toggleRayCasting() {
    rayCastingActive = rayCastingActive ? 0.0 : 1.0;
}

function setDiffuseMode(mode) {
    diffuseMode = mode;
}

function setSpecularMode(mode) {
    specularMode = mode;
}