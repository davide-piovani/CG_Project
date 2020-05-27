let lastUpdateTime;     //Todo: delete

function loadSceneObjects() {
    let obj1 = new SceneObject();
    obj1.setParams({x: -1.0, z: -1.0})
    let obj2 = new SceneObject();
    obj2.setParams({x: +1.0, z: -1.0});
    sceneObjects.push(obj1, obj2);
}

function loadAttribAndUniformsLocations() {
    locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    locations.colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
}

function calculateMatrices() {
    matrices.projectionMatrix = utils.MakePerspective(fieldOfView, a, n, f);
    matrices.viewMatrix = utils.MakeView(camera.x, camera.y, camera.z, camera.elev, camera.angle);
}

function passAssetsDataToShaders() {
    loadArrayBuffer(new Float32Array(vertices), locations.positionAttributeLocation, 3);
    loadArrayBuffer(new Float32Array(colors), locations.colorAttributeLocation, 3);
    loadIndexBuffer(new Uint16Array(indices));
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
        let worldViewMatrix = utils.multiplyMatrices(matrices.viewMatrix, sceneObject.getObjectWorldMatrix());
        let wvpMatrix = utils.multiplyMatrices(matrices.projectionMatrix, worldViewMatrix);

        gl.uniformMatrix4fv(locations.wvpMatrixLocation, gl.FALSE, utils.transposeMatrix(wvpMatrix));

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

    drawScene();
}

async function init() {
    setUpCanvas();
    await loadProgram(false);

    loadSceneObjects();

    main();
}

function resize() {
    resizeCanvas();
    calculateMatrices();
}

window.onload = init;
window.onresize = resize;

