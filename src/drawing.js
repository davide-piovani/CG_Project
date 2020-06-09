let lastUpdateTime;     //Todo: delete

function loadSceneObjects() {
    let obj1 = new SceneObject();
    obj1.setParams({x: -1.3, z: -1.0, s: 0.15, asset: assets.electron});
    let obj2 = new SceneObject();
    obj2.setParams({x: 0.0, z: -1.0, s: 0.2, asset: assets.carbon});
    sceneObjects.push(obj1, obj2);
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

    assets.electron = await getAsset(electronPath);
    assets.carbon = await getAsset(carbonPath);
    assets.hydrogen = await getAsset(hydrogenPath);
    assets.helium = await getAsset(heliumPath);
    assets.oxygen = await getAsset(oxygenPath);
}

function loadAttribAndUniformsLocations() {
    locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    locations.uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
    locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
    locations.textureLocation = gl.getUniformLocation(program, "u_texture");
}

function calculateMatrices() {
    matrices.projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
    matrices.viewMatrix = utils.MakeView(camera.x, camera.y, camera.z, camera.elev, camera.angle);
}

function passAssetsDataToShaders(asset) {
    loadArrayBuffer(new Float32Array(asset.vertices), locations.positionAttributeLocation, 3);
    loadArrayBuffer(new Float32Array(asset.textures), locations.uvAttributeLocation, 2);
    loadIndexBuffer(new Uint16Array(asset.indices));
}

function animate(){
    let currentTime = (new Date).getTime();
    
    for(let i = 0; i < sceneObjects.length; i++) {
        let sign = (i % 2 === 0) ? 1 : -1;

        if(lastUpdateTime){
            let deltaC = sign * (30 * (currentTime - lastUpdateTime)) / 1000.0;
            sceneObjects[i].rx += deltaC;
            sceneObjects[i].ry -= deltaC;
            sceneObjects[i].rz += deltaC;
        }
    }
    
    lastUpdateTime = currentTime;
}

function drawScene() {
    //animate();

    eraseCanvas();

    sceneObjects.forEach((sceneObject) => {
        let worldViewMatrix = utils.multiplyMatrices(matrices.viewMatrix, sceneObject.getWorldMatrix());
        let wvpMatrix = utils.multiplyMatrices(matrices.projectionMatrix, worldViewMatrix);

        passAssetsDataToShaders(sceneObject.asset);

        gl.uniformMatrix4fv(locations.wvpMatrixLocation, gl.FALSE, utils.transposeMatrix(wvpMatrix));

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(locations.textureLocation, assets.texture);

        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, sceneObject.asset.indices.length, gl.UNSIGNED_SHORT, 0 );
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

async function init() {
    setUpCanvas();
    initializePaths();
    await loadProgram();

    await loadAssets();
    loadTexture();
    loadSceneObjects();

    main();
}

function resize() {
    resizeCanvas();
    calculateMatrices();
}

window.onload = init;
window.onresize = resize;

