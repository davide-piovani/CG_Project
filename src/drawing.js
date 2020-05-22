let gl;
let program;
let vao;
let lastUpdateTime;     //Todo: delete

//List of locations we are going to use in the shaders
let locations = {
    positionAttributeLocation: null,
    colorAttributeLocation: null,
    matrixLocation: null
}

let cube = {            //Todo: delete
    Rx: 0.0,
    Ry: 0.0,
    Rz: 0.0
}

let matrices = {
    worldMatrix: null,
    viewMatrix: null,
    perspectiveMatrix: null
}

function eraseCanvas() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function setUpCanvas() {
    let canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {document.write("GL context not opened"); return; }

    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    eraseCanvas();
    gl.enable(gl.DEPTH_TEST);
}

async function loadProgram() {
    let path = window.location.pathname;
    let page = path.split("/").pop();
    let baseDir = window.location.href.replace(page, '');
    let shaderDir = baseDir+"src/shaders/";

    await utils.loadFiles([shaderDir + 'vertexShader.glsl', shaderDir + 'fragmentShader.glsl'], function (shaderText) {
        let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    gl.useProgram(program);
}

function loadAttribAndUniformsLocations() {
    locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    locations.colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    locations.matrixLocation = gl.getUniformLocation(program, "matrix");
}

function initializeMatrices() {
    matrices.perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    matrices.viewMatrix = utils.MakeView(0.0, 0.0, 1.0, 0.0, 0.0);
}

function loadArrayBuffer(data, location, size) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

function loadIndexBuffer(data) {
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function animate(){         //Todo: delete
    let currentTime = (new Date).getTime();

    if(lastUpdateTime){
        let deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
        cube.Rx += deltaC;
        cube.Ry -= deltaC;
        cube.Rz += deltaC;
    }

    lastUpdateTime = currentTime;
    matrices.worldMatrix = utils.MakeWorld( 0.0, 0.0, -1.0, cube.Rx, cube.Ry, cube.Rz, 1.0);
}

function drawScene() {      //Todo: delete
    animate();

    eraseCanvas();

    let viewWorldMatrix = utils.multiplyMatrices(matrices.viewMatrix, matrices.worldMatrix);
    let projectionMatrix = utils.multiplyMatrices(matrices.perspectiveMatrix, viewWorldMatrix);

    gl.uniformMatrix4fv(locations.matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );

    window.requestAnimationFrame(drawScene);
}


function main() {
    loadAttribAndUniformsLocations();
    initializeMatrices();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    loadArrayBuffer(new Float32Array(vertices), locations.positionAttributeLocation, 3);
    loadArrayBuffer(new Float32Array(colors), locations.colorAttributeLocation, 3);
    loadIndexBuffer(new Uint16Array(indices));

    drawScene();
}

async function init() {
    setUpCanvas();
    await loadProgram();

    main();
}

window.onload = init;

