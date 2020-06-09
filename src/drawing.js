let lastUpdateTime;     //Todo: delete

function addObjectToScene(params) {
    let obj = new SceneObject();
    obj.setParams(params);
    sceneObjects.push(obj);
}

function setAtom(asset) {
    atom = asset;
    sceneObjects = [];

    addObjectToScene({x: 0.0, z: -1.0, s: nucleous_scale, asset: asset});
    let partialAngle = 2 * Math.PI / asset.n_el;

    for(let i = 0; i < asset.n_el; i++) {
        addObjectToScene({x: Math.cos(partialAngle*i), y: Math.sin(partialAngle*i), z: -1.0, s: e_scale, asset: assets.electron});
    }

}

async function getAsset(path, n) {
    let objStr = await utils.get_objstr(path);
    let objModel = new OBJ.Mesh(objStr);

    return {
        vertices: objModel.vertices,
        normals: objModel.vertexNormals,
        indices: objModel.indices,
        textures: objModel.textures,
        n_el: n
    }
}

async function loadAssets() {
    let electronPath = paths.assets + "/E/electron.obj";
    let carbonPath = paths.assets + "/C/nucleusC.obj";
    let hydrogenPath = paths.assets + "/H/nucleusH.obj";
    let heliumPath = paths.assets + "/He/nucleusHe.obj";
    let oxygenPath = paths.assets + "/O/nucleusO.obj";

    assets.electron = await getAsset(electronPath, assets.electron.n_el);
    assets.carbon = await getAsset(carbonPath, assets.carbon.n_el);
    assets.hydrogen = await getAsset(hydrogenPath, assets.hydrogen.n_el);
    assets.helium = await getAsset(heliumPath, assets.helium.n_el);
    assets.oxygen = await getAsset(oxygenPath, assets.oxygen.n_el);
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
    setAtom(assets.hydrogen);

    main();
}

function resize() {
    resizeCanvas();
    calculateMatrices();
}

function keyFunction(e){
    let prev; let next;

    switch (atom) {
        case assets.hydrogen:
            prev = null;
            next = assets.helium;
            break;
        case assets.helium:
            prev = assets.hydrogen;
            next = assets.carbon;
            break;
        case assets.carbon:
            prev = assets.helium;
            next = assets.oxygen;
            break;
        case assets.oxygen:
            prev = assets.carbon;
            next = null;
            break;
    }

    if (e.keyCode == 38) {  // Up arrow
        if (prev) setAtom(prev);
    }
    if (e.keyCode == 40) {  // Down arrow
        if (next) setAtom(next);
    }


}

window.onload = init;
window.onresize = resize;
window.addEventListener("keyup", keyFunction, false);

