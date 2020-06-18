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
        let electronOrbit = new SceneNode(atomOrbit, null, {x: 0.707, z: 0.707});
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

function loadUniforms(drawInfo, locations, i) {
    // Object params
    if (locations.hasOwnProperty("textureLocation")) gl.uniform1i(locations.textureLocation[i], assetsData[AssetType.TEXTURE].texture);
    if (locations.hasOwnProperty("ambientColorLocation")) gl.uniform4fv(locations.ambientColorLocation[i], new Float32Array(drawInfo.ambientColor));
    if (locations.hasOwnProperty("emissionColorLocation")) gl.uniform4fv(locations.emissionColorLocation[i], new Float32Array(drawInfo.emissionColor));

    // Lights params
    if (locations.hasOwnProperty("isDayLocation")) gl.uniform1f(locations.isDayLocation[i], isDay);
    if (locations.hasOwnProperty("directLightDirectionLocation")) gl.uniform3fv(locations.directLightDirectionLocation[i], new Float32Array(utils.getDir(directLightXRot, directLightYRot)));
    if (locations.hasOwnProperty("directLightColorLocation")) gl.uniform4fv(locations.directLightColorLocation[i], new Float32Array(directLight));
    if (locations.hasOwnProperty("ambientLightLocation")) gl.uniform4fv(locations.ambientLightLocation[i], new Float32Array([ambientLight, ambientLight, ambientLight, 1.0]));
    if (locations.hasOwnProperty("lightTargetLocation")) gl.uniform1f(locations.lightTargetLocation[i], assetsData[AssetType.ELECTRON].drawInfo.lightInfo.g);
    if (locations.hasOwnProperty("lightDecayLocation")) gl.uniform1f(locations.lightDecayLocation[i], assetsData[AssetType.ELECTRON].drawInfo.lightInfo.decay);

    // Raycasting params
    if (locations.hasOwnProperty("electronRadiusLocation")) gl.uniform1f(locations.electronRadiusLocation[i], assetsData[AssetType.ELECTRON].other.asset_radius);
    if (locations.hasOwnProperty("rayCastingLocation")) gl.uniform1f(locations.rayCastingLocation[i], rayCastingActive);

    // BRDF
    if (locations.hasOwnProperty("diffuseModeLocation")) gl.uniform1f(locations.diffuseModeLocation[i], diffuseMode);
    if (locations.hasOwnProperty("specularModeLocation")) gl.uniform1f(locations.specularModeLocation[i], specularMode);
    if (locations.hasOwnProperty("specShineLocation")) gl.uniform1f(locations.specShineLocation[i], drawInfo.specShine);
    if (locations.hasOwnProperty("sigmaLocation")) gl.uniform1f(locations.sigmaLocation[i], drawInfo.sigma*drawInfo.sigma);
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

        let index = (sceneNode.assetType === AssetType.ELECTRON || sceneNode.assetType === AssetType.FLOOR) ? 0 : smoothType;

        gl.useProgram(drawInfo.program[index]);

        gl.uniformMatrix4fv(locations.wvpMatrixLocation[index], gl.FALSE, utils.transposeMatrix(wvpMatrix));

        let inverseWorldMatrix = utils.invertMatrix(sceneNode.worldMatrix);

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

            gl.uniform3fv(locations.lightPositionLocation[index], new Float32Array(lightPos));
            gl.uniform4fv(locations.lightColorLocation[index], new Float32Array(lightCol));
        }

        if (locations.hasOwnProperty("eyePosLocation")) {
            let eyePos = camera.getWorldPosition();
            let matrix = utils.MakeScaleMatrix(1/0.2);
            let objectEyePos = utils.multiplyMatrixVector(matrix, eyePos);
            gl.uniform3fv(locations.eyePosLocation[index], new Float32Array([objectEyePos[0], objectEyePos[1], objectEyePos[2]]));
        }

        loadUniforms(assetsData[sceneNode.assetType].drawInfo, locations, index);

        gl.bindVertexArray(drawInfo.vao[index]);
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

    initElectronRadiusSquared();

    setAtom(AssetType.HYDROGEN);

    main();
}

window.onresize = resizeCanvas

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


function setSpecShine(value) {
    let types = [AssetType.HYDROGEN, AssetType.HELIUM, AssetType.CARBON, AssetType.OXYGEN];
    for(let type of types) assetsData[type].drawInfo.specShine = value;
}

function setSigma(value) {
    if (value < 0) value = 0.0;
    if (value > Math.PI / 2.0) value = Math.PI / 2.0;

    let types = [AssetType.HYDROGEN, AssetType.HELIUM, AssetType.CARBON, AssetType.OXYGEN];
    for(let type of types) assetsData[type].drawInfo.sigma = value;
}

function toggleSmooth() {
    smoothType = smoothType === Smooth.VERTEX ? Smooth.PIXEL : Smooth.VERTEX;
}

function setDayLight(active) {
    //TODO: da modificare
    if (active) {
        assetsData[AssetType.ELECTRON].drawInfo.emissionColor = [0, 0, 0, 0];
        assetsData[AssetType.FLOOR].drawInfo.ambientColor = assetsData[AssetType.FLOOR].drawInfo.dayColor;
        ambientLight = 0.6;
        isDay = 1.0;
        console.log("Day");
    } else {
        assetsData[AssetType.ELECTRON].drawInfo.emissionColor = [0.97, 0.89, 0.05, 1.0];
        assetsData[AssetType.FLOOR].drawInfo.ambientColor = assetsData[AssetType.FLOOR].drawInfo.nightColor;
        ambientLight = 0.25;
        isDay = 0.0;
        console.log("Night");
    }
}