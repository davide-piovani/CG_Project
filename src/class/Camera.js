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
    mode = 2;           //0: viewFromX, 1: viewFromY, 2: viewFromZ

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

    viewFromX = () => {
        this.viewInfo = {
            x: 2.0, y: 0.0, z: 0.0,
            elev: 0.0,
            angle: 90.0
        }
        this.mode = 0;
        this.updateViewMatrix();
    }

    viewFromY = () => {
        this.viewInfo = {
            x: 0.0, y: 2.0, z: 0.0,
            elev: -90.0,
            angle: 0.0
        }
        this.mode = 1;
        this.updateViewMatrix();
    }

    viewFromZ = () => {
        this.viewInfo = {
            x: 0.0, y: 0.0, z: 2.0,
            elev: 0.0,
            angle: 0.0
        }
        this.mode = 2;
        this.updateViewMatrix();
    }

    moveBack = (amount) => {
        switch (this.mode) {
            case 0:
                camera.viewInfo.x += amount;
                break;
            case 1:
                camera.viewInfo.y += amount;
                break;
            case 2:
                camera.viewInfo.z += amount;
                break;
        }
        this.updateViewMatrix();
    }

    moveForward = (amount) => {
        switch (this.mode) {
            case 0:
                camera.viewInfo.x -= amount;
                break;
            case 1:
                camera.viewInfo.y -= amount;
                break;
            case 2:
                camera.viewInfo.z -= amount;
                break;
        }
        this.updateViewMatrix();
    }
}