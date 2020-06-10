let lastUpdateTime;
let lastAsset;
let startTime = (new Date).getTime();

function addObjectToScene(params) {
    let obj = new SceneObject();
    obj.setParams(params);
    sceneObjects.push(obj);
}

function setAtom(asset) {
    atom = asset;
    sceneObjects = [];

    addObjectToScene({x: asset.center.x, y: asset.center.y, s: nucleous_scale, asset: asset});

    for(let i = 0; i < asset.n_el; i++) {
        let animation = new AtomAnimation(1.0, trajectories[i]);
        addObjectToScene({s: e_scale, asset: assets.electron, animation: animation});
    }
}

async function getAsset(path, asset) {
    let objStr = await utils.get_objstr(path);
    let objModel = new OBJ.Mesh(objStr);

    return {
        vertices: objModel.vertices,
        normals: objModel.vertexNormals,
        indices: objModel.indices,
        textures: objModel.textures,
        n_el: asset.n_el,
        center: asset.center
    }
}

async function loadAssets() {
    let electronPath = paths.assets + "/E/electron.obj";
    let carbonPath = paths.assets + "/C/nucleusC.obj";
    let hydrogenPath = paths.assets + "/H/nucleusH.obj";
    let heliumPath = paths.assets + "/He/nucleusHe.obj";
    let oxygenPath = paths.assets + "/O/nucleusO.obj";

    assets.electron = await getAsset(electronPath, assets.electron);
    assets.carbon = await getAsset(carbonPath, assets.carbon);
    assets.hydrogen = await getAsset(hydrogenPath, assets.hydrogen);
    assets.helium = await getAsset(heliumPath, assets.helium);
    assets.oxygen = await getAsset(oxygenPath, assets.oxygen);
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
    if (lastAsset === asset) return;
    lastAsset = asset;
    loadArrayBuffer(new Float32Array(asset.vertices), locations.positionAttributeLocation, 3);
    loadArrayBuffer(new Float32Array(asset.textures), locations.uvAttributeLocation, 2);
    loadIndexBuffer(new Uint16Array(asset.indices));
}

function animate(){
    let currentTime = (new Date).getTime();
    let elapsedTime = currentTime - startTime;

    sceneObjects.forEach((sceneObject) => {
        if (sceneObject.animation != null) {
            let params = sceneObject.animation.getPosAtTime(elapsedTime);
            sceneObject.setParams(params);
        }
    })

    lastUpdateTime = currentTime;
}

function drawScene() {
    animate();

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

