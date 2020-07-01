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
    setFloor(floorIsVisible);

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

function loadUniforms(drawInfo, locations, index, objectInverseWorldMatrix) {
    // Object params
    if (locations.hasOwnProperty("textureLocation")) gl.uniform1i(locations.textureLocation[index], assetsData[AssetType.TEXTURE].texture);
    if (locations.hasOwnProperty("ambientColorLocation")) gl.uniform4fv(locations.ambientColorLocation[index], new Float32Array(drawInfo.ambientColor));

    // Lights params
    if (locations.hasOwnProperty("isDayLocation")) gl.uniform1f(locations.isDayLocation[index], isDay);
    if (locations.hasOwnProperty("ambientLightLocation")) gl.uniform4fv(locations.ambientLightLocation[index], new Float32Array([ambientLight, ambientLight, ambientLight, 1.0]));

    // BRDF
    if (locations.hasOwnProperty("diffuseModeLocation")) gl.uniform1f(locations.diffuseModeLocation[index], diffuseMode);
    if (locations.hasOwnProperty("specularModeLocation")) gl.uniform1f(locations.specularModeLocation[index], specularMode);
    if (locations.hasOwnProperty("specShineLocation")) gl.uniform1f(locations.specShineLocation[index], drawInfo.specShine);
    if (locations.hasOwnProperty("sigmaLocation")) gl.uniform1f(locations.sigmaLocation[index], drawInfo.sigma*drawInfo.sigma);

    // Eye
    if (locations.hasOwnProperty("eyePosLocation")) {
        let eyePos = camera.getCordsInObjectSpace(objectInverseWorldMatrix);
        gl.uniform3fv(locations.eyePosLocation[index], new Float32Array([eyePos[0], eyePos[1], eyePos[2]]));
    }
}

function loadDayUniforms(locations, index, objectWorldMatrix) {
    // Lights params
    if (locations.hasOwnProperty("directLightColorLocation")) gl.uniform4fv(locations.directLightColorLocation[index], new Float32Array(directLight));
    if (locations.hasOwnProperty("directLightDirectionLocation")) {
        let lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(objectWorldMatrix));
        let lightDir = utils.getDir(directLightXRot, directLightYRot);
        let directionalLightTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix, lightDir));
        gl.uniform3fv(locations.directLightDirectionLocation[index], new Float32Array(directionalLightTransformed));
    }
}

function loadNightUniforms(drawInfo, locations, index, objectInverseWorldMatrix) {
    // Object params
    if (locations.hasOwnProperty("emissionColorLocation")) gl.uniform4fv(locations.emissionColorLocation[index], new Float32Array(drawInfo.emissionColor));

    // Lights params
    if (locations.hasOwnProperty("lightTargetLocation")) gl.uniform1f(locations.lightTargetLocation[index], assetsData[AssetType.ELECTRON].drawInfo.lightInfo.g);
    if (locations.hasOwnProperty("lightDecayLocation")) gl.uniform1f(locations.lightDecayLocation[index], assetsData[AssetType.ELECTRON].drawInfo.lightInfo.decay);

    // Raycasting params
    if (locations.hasOwnProperty("electronRadiusLocation")) gl.uniform1f(locations.electronRadiusLocation[index], assetsData[AssetType.ELECTRON].other.asset_radius);
    if (locations.hasOwnProperty("rayCastingLocation")) gl.uniform1f(locations.rayCastingLocation[index], rayCastingActive);

    if (locations.hasOwnProperty("lightPositionLocation") && locations.hasOwnProperty("lightColorLocation")) {
        let electronLightColor = assetsData[AssetType.ELECTRON].drawInfo.lightInfo.color;
        let lightPos = [];
        let lightCol = [];

        for(let i = 0; i < 8; i++){
            if (lights[i]) {
                let lightObjectCords = lights[i].getCordsInObjectSpace(objectInverseWorldMatrix);
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
}


function drawScene() {
    animate();

    eraseCanvas();
    rootNode.updateWorldMatrix();

    objectsToRender.forEach((sceneNode) => {
        let inverseWorldMatrix = utils.invertMatrix(sceneNode.worldMatrix);
        let worldViewMatrix = utils.multiplyMatrices(camera.viewMatrix, sceneNode.worldMatrix);
        let wvpMatrix = utils.multiplyMatrices(camera.projectionMatrix, worldViewMatrix);

        let drawInfo = assetsData[sceneNode.assetType].drawInfo;
        let locations = drawInfo.locations;
        let index = (sceneNode.assetType === AssetType.FLOOR) ? 0 : smoothType;

        gl.useProgram(drawInfo.program[index]);
        gl.uniformMatrix4fv(locations.wvpMatrixLocation[index], gl.FALSE, utils.transposeMatrix(wvpMatrix));

        loadUniforms(drawInfo, locations, index, inverseWorldMatrix);
        if (isDay) loadDayUniforms(locations, index, sceneNode.worldMatrix);
        else loadNightUniforms(drawInfo, locations, index, inverseWorldMatrix);

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