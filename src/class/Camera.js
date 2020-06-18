class Camera {
    viewInfo = {
        x: 0.0, y: 0.0, z: 2.0,
        elev: 0.0,        //rotation over the x-axis
        angle: 0.0        //rotation over the y-axis
    }

    projectionInfo = {
        a: 1.0, n: 0.1, f: 100.0, w: 3, fieldOfView: 90
    }

    viewMatrix;
    projectionMatrix;

    Mode = {
        OUTSIDE: 0,
        INSIDE: 1
    }
    mode = this.Mode.OUTSIDE;

    updateViewMatrix = () => {
        this.viewMatrix = utils.MakeView(this.viewInfo.x, this.viewInfo.y, this.viewInfo.z, this.viewInfo.elev, this.viewInfo.angle);
    }

    updateProjectionMatrix = () => {
        //this.projectionMatrix = utils.MakeParallel(this.projectionInfo.w, this.projectionInfo.a, this.projectionInfo.n, this.projectionInfo.f);
        this.projectionMatrix = projectionMatrix = utils.MakePerspective(this.projectionInfo.fieldOfView, this.projectionInfo.a, this.projectionInfo.n, this.projectionInfo.f);
    }

    setAspectRatio = (a) => {
        this.projectionInfo.a = a;
        this.updateProjectionMatrix();
    }

    getWorldPosition = () => {
        return [this.viewInfo.x, this.viewInfo.y, this.viewInfo.z, 1.0];
    }

    getDir = () => {
        let angle = this.viewInfo.angle * Math.PI / 180.0;
        let elev = this.viewInfo.elev * Math.PI / 180.0;
        let threshold = 0.00001;

        let x = - Math.sin(angle);
        let y = + Math.sin(elev);
        let z = - Math.cos(angle) * Math.cos(elev);

        if (Math.abs(x) < threshold) x = 0.0;
        if (Math.abs(y) < threshold) y = 0.0;
        if (Math.abs(z) < threshold) z = 0.0;

        return [x, y, z];
    }

    setPosition = (cords) => {
        if (cords){
            if (cords.x !== undefined) this.viewInfo.x = cords.x;
            if (cords.y !== undefined) this.viewInfo.y = cords.y;
            if (cords.z !== undefined) this.viewInfo.z = cords.z;
            if (cords.elev !== undefined) this.viewInfo.elev = cords.elev;
            if (cords.angle !== undefined) this.viewInfo.angle = cords.angle;
            this.updateViewMatrix();
        }
    }

    setMode = (mode) => {
        this.mode = mode;

        let cameraPos = this.getWorldPosition();
        if (cameraPos[0] === 0.0 && cameraPos[1] === 0.0 && cameraPos[2] === 0.0) {
            camera.viewFromZ();
            objectsToRender.unshift(atom);
        } else {
            camera.setPosition({x: 0.0, y: 0.0, z: 0.0});
            objectsToRender.splice(0, 1);
        }
    }

    viewFromX = () => {
        this.setPosition({ x: 2.0, y: 0.0, z: 0.0, elev: 0.0, angle: 90.0 });
    }

    viewFromY = () => {
        this.setPosition({ x: 0.0, y: 2.0, z: 0.0, elev: -90.0, angle: 0.0 });
    }

    viewFromZ = () => {
        this.setPosition({ x: 0.0, y: 0.0, z: 2.0, elev: 0.0, angle: 0.0 });
    }

    Magnitude = {
        FORWARD:  +1.0,
        BACKWARD: -1.0
    }

    moveInDirection = (magnitude) => {
        let cameraDir = this.getDir();
        let translateVector = [magnitude*cameraDir[0]*cameraVelocity, magnitude*cameraDir[1]*cameraVelocity, magnitude*cameraDir[2]*cameraVelocity];
        let translateMatrix = utils.MakeTranslateMatrix(translateVector[0], translateVector[1], translateVector[2]);
        let newPos = utils.multiplyMatrixVector(translateMatrix, this.getWorldPosition());
        this.setPosition({x: newPos[0], y: newPos[1], z: newPos[2]})
        this.updateViewMatrix();
    }

    moveBackward = () => {
        this.moveInDirection(this.Magnitude.BACKWARD);
    }

    moveForward = () => {
        this.moveInDirection(this.Magnitude.FORWARD);
    }
}