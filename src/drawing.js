let lastUpdateTime;     //Todo: delete

function loadSceneObjects() {
    let obj1 = new SceneObject();
    obj1.setParams({x: -1.0, z: -1.0})
    let obj2 = new SceneObject();
    obj2.setParams({x: +1.0, z: -1.0});
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
    let assetsPath = baseDir+"src/assets";

    let electronPath = assetsPath + "/electron.obj";
    let carbonPath = assetsPath + "/Atoms/C/nucleusC.obj";
    let hydrogenPath = assetsPath + "/Atoms/H/nucleusH.obj";
    let heliumPath = assetsPath + "/Atoms/He/nucleusHe.obj";
    let oxygenPath = assetsPath + "/Atoms/O/nucleusO.obj";

    assets.electron = await getAsset(electronPath);
    assets.carbon = await getAsset(carbonPath);
    assets.hydrogen = await getAsset(hydrogenPath);
    assets.helium = await getAsset(heliumPath);
    assets.oxygen = await getAsset(oxygenPath);
}

function loadAttribAndUniformsLocations() {
    locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    locations.uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
    //locations.colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
    locations.textureLocation = gl.getUniformLocation(program, "u_texture");
}

function calculateMatrices() {
    matrices.projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
    matrices.viewMatrix = utils.MakeView(camera.x, camera.y, camera.z, camera.elev, camera.angle);
}

function passAssetsDataToShaders() {
    loadArrayBuffer(new Float32Array(assets.electron.vertices), locations.positionAttributeLocation, 3);
    loadArrayBuffer(new Float32Array(assets.electron.textures), locations.uvAttributeLocation, 2);
    //loadArrayBuffer(new Float32Array(assets.electron.textures), locations.colorAttributeLocation, 3);
    loadIndexBuffer(new Uint16Array(assets.electron.indices));
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
    animate();

    eraseCanvas();

    sceneObjects.forEach((sceneObject) => {
        let worldViewMatrix = utils.multiplyMatrices(matrices.viewMatrix, sceneObject.getWorldMatrix());
        let wvpMatrix = utils.multiplyMatrices(matrices.projectionMatrix, worldViewMatrix);

        gl.uniformMatrix4fv(locations.wvpMatrixLocation, gl.FALSE, utils.transposeMatrix(wvpMatrix));

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(locations.textureLocation, texture);

        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );
    })

    window.requestAnimationFrame(drawScene);
}

function main() {
    calculateMatrices();
    loadAttribAndUniformsLocations();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    passAssetsDataToShaders();

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    let image = new Image();
    image.src = baseDir+"src/assets/texture.png";
    image.onload= function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    };

    drawScene();
}

async function init() {
    setUpCanvas();
    getBaseDir();
    await loadProgram(true);

    loadSceneObjects();
    await loadAssets();

    main();
}

function resize() {
    resizeCanvas();
    calculateMatrices();
}

window.onload = init;
window.onresize = resize;

