function eraseCanvas() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
    paths.assets = paths.base + paths.assets;
    paths.texture = paths.base + paths.texture;

    paths.shaders.base = paths.base + paths.shaders.base;

    paths.shaders.vs = {
        atom: paths.shaders.base + paths.shaders.vs.atom,
        electron: paths.shaders.base + paths.shaders.vs.electron,
        floor: paths.shaders.base + paths.shaders.vs.floor
    }

    paths.shaders.fs = {
        atom: paths.shaders.base + paths.shaders.fs.atom,
        electron: paths.shaders.base + paths.shaders.fs.electron,
        floor: paths.shaders.base + paths.shaders.fs.floor
    }
}

async function loadProgram(vs_path, fs_path) {
    await utils.loadFiles([vs_path, fs_path], function (shaderText) {
        let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    return program;
}

async function loadPrograms() {
    assetsData[AssetType.ELECTRON].drawInfo.program = await loadProgram(paths.shaders.vs.electron, paths.shaders.fs.electron);
    let atomProgram = await loadProgram(paths.shaders.vs.atom, paths.shaders.fs.atom);
    assetsData[AssetType.HYDROGEN].drawInfo.program = atomProgram;
    assetsData[AssetType.HELIUM].drawInfo.program = atomProgram;
    assetsData[AssetType.CARBON].drawInfo.program = atomProgram;
    assetsData[AssetType.OXYGEN].drawInfo.program = atomProgram;
    assetsData[AssetType.FLOOR].drawInfo.program = await loadProgram(paths.shaders.vs.floor, paths.shaders.fs.floor);
}

async function getStruct(path) {
    let objStr = await utils.get_objstr(path);
    let objModel = new OBJ.Mesh(objStr);

    return {
        vertices: objModel.vertices,
        normals: objModel.vertexNormals,
        indices: objModel.indices,
        textures: objModel.textures
    }
}

async function loadAssetsStruct() {
    let electronPath = paths.assets + "/E/electron.obj";
    let carbonPath = paths.assets + "/C/nucleusC.obj";
    let hydrogenPath = paths.assets + "/H/nucleusH.obj";
    let heliumPath = paths.assets + "/He/nucleusHe.obj";
    let oxygenPath = paths.assets + "/O/nucleusO.obj";

    assetsData[AssetType.ELECTRON].structInfo = await getStruct(electronPath);
    assetsData[AssetType.HYDROGEN].structInfo = await getStruct(hydrogenPath);
    assetsData[AssetType.HELIUM].structInfo = await getStruct(heliumPath);
    assetsData[AssetType.CARBON].structInfo = await getStruct(carbonPath);
    assetsData[AssetType.OXYGEN].structInfo = await getStruct(oxygenPath);
}

function loadTexture() {
    let texture = gl.createTexture();
    assetsData[AssetType.TEXTURE].texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    let image = new Image();
    image.src = paths.texture;
    image.onload= function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    gl.activeTexture(gl.TEXTURE0);
}

function loadAtomAttribAndUniformsLocations() {
    let types = [AssetType.HYDROGEN, AssetType.HELIUM, AssetType.CARBON, AssetType.OXYGEN];

    for(let assetType of types){
        let program = assetsData[assetType].drawInfo.program;

        assetsData[assetType].drawInfo.locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        assetsData[assetType].drawInfo.locations.uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
        assetsData[assetType].drawInfo.locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
        assetsData[assetType].drawInfo.locations.textureLocation = gl.getUniformLocation(program, "u_texture");

        assetsData[assetType].drawInfo.locations.lightColorLocation = gl.getUniformLocation(program, "light_color");
        assetsData[assetType].drawInfo.locations.lightPositionLocation = gl.getUniformLocation(program, "light_pos");
        assetsData[assetType].drawInfo.locations.lightTargetLocation = gl.getUniformLocation(program, "light_g");
        assetsData[assetType].drawInfo.locations.lightDecayLocation = gl.getUniformLocation(program, "light_decay");
    }
}

function loadElectronAttribAndUniformsLocations() {
    let assetType = AssetType.ELECTRON;
    let program = assetsData[assetType].drawInfo.program;

    assetsData[assetType].drawInfo.locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    assetsData[assetType].drawInfo.locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
    assetsData[assetType].drawInfo.locations.difColorLocation = gl.getUniformLocation(program, "difColor");
}

function loadFloorAttribAndUniformsLocations() {
    let assetType = AssetType.FLOOR;
    let program = assetsData[assetType].drawInfo.program;

    assetsData[assetType].drawInfo.locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    assetsData[assetType].drawInfo.locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
    assetsData[assetType].drawInfo.locations.difColorLocation = gl.getUniformLocation(program, "difColor");
}

function loadAttribAndUniformsLocations() {
    loadAtomAttribAndUniformsLocations();
    loadElectronAttribAndUniformsLocations();
    loadFloorAttribAndUniformsLocations();
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

function loadVao(assetType) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let asset = assetsData[assetType];
    let structInfo = asset.structInfo;
    let locations = asset.drawInfo.locations;

    loadArrayBuffer(new Float32Array(structInfo.vertices), locations.positionAttributeLocation, 3);
    if (assetType !== AssetType.FLOOR && assetType !== AssetType.ELECTRON) loadArrayBuffer(new Float32Array(structInfo.textures), locations.uvAttributeLocation, 2);
    loadIndexBuffer(new Uint16Array(structInfo.indices));

    assetsData[assetType].drawInfo.bufferLength = assetsData[assetType].structInfo.indices.length;
    assetsData[assetType].drawInfo.vao = vao;
}

function loadVaos() {
    applyToAll(loadVao);
}

function applyToAll(func) {     //TODO: delete
    func(AssetType.ELECTRON);
    func(AssetType.HYDROGEN);
    func(AssetType.HELIUM);
    func(AssetType.CARBON);
    func(AssetType.OXYGEN);
    func(AssetType.FLOOR);
}