function eraseCanvas() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function resizeCanvas() {
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    a = gl.canvas.width/gl.canvas.height;
}

function setUpCanvas() {
    let canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {document.write("GL context not opened"); return; }

    resizeCanvas();
    eraseCanvas();
    gl.enable(gl.DEPTH_TEST);
}

function initializePaths() {
    let path = window.location.pathname;
    let page = path.split("/").pop();

    paths.base = window.location.href.replace(page, '');
    paths.shaders = paths.base + paths.shaders;
    paths.assets = paths.base + paths.assets;
    paths.texture = paths.base + paths.texture;
}

async function loadProgram() {
    let vs_path = paths.shaders + '/vertexShader.glsl';
    let fs_path = paths.shaders + '/fragmentShader.glsl';

    await utils.loadFiles([vs_path, fs_path], function (shaderText) {
        let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    gl.useProgram(program);
}

function loadTexture() {
    assets.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, assets.texture);

    let image = new Image();
    image.src = paths.texture;
    image.onload= function() {
        gl.bindTexture(gl.TEXTURE_2D, assets.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
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