class SceneNode {
    parent = null;
    children = [];
    defCords;
    localCords = {
        x: 0.0, y: 0.0, z: 0.0, rx: 0.0, ry: 0.0, rz: 0.0, s: 1.0
    };
    worldMatrix;
    assetType;
    animation;

    constructor(parent, assetType, cords) {
        this.assetType = assetType;
        this.defCords = cords;
        this.setPosition(cords);
        this.setParent(parent);
    }

    resetPosition = () => {
        this.localCords.x = 0.0;
        this.localCords.y = 0.0;
        this.localCords.z = 0.0;
        this.localCords.rx = 0.0;
        this.localCords.ry = 0.0;
        this.localCords.rz = 0.0;
        this.localCords.s = 1.0;

        this.setPosition(this.defCords);
    }
    
    setPosition = (cords) => {
        if (cords){
            if (cords.hasOwnProperty("x")) this.localCords.x = cords.x;
            if (cords.hasOwnProperty("y")) this.localCords.y = cords.y;
            if (cords.hasOwnProperty("z")) this.localCords.z = cords.z;
            if (cords.hasOwnProperty("rx")) this.localCords.rx = cords.rx;
            if (cords.hasOwnProperty("ry")) this.localCords.ry = cords.ry;
            if (cords.hasOwnProperty("rz")) this.localCords.rz = cords.rz;
            if (cords.hasOwnProperty("s")) this.localCords.s = cords.s;
        }
    }

    setParent = (parent) => {
        // Remove this from parent children
        if (this.parent) {
            let ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) this.parent.children.splice(ndx, 1);
        }

        // Add this to the new parent
        if (parent) parent.children.push(this);
        this.parent = parent;
    }

    setAnimation = (animation) => {
        if (animation) this.animation = animation;
    }
    
    getLocalMatrix = () => {
        return utils.MakeWorld(this.localCords.x, this.localCords.y, this.localCords.z, this.localCords.rx, this.localCords.ry, this.localCords.rz, this.localCords.s);
    }

    updateWorldMatrix = (parentWolrdMatrix) => {
        let localMatrix = this.getLocalMatrix();
        if (parentWolrdMatrix) this.worldMatrix = utils.multiplyMatrices(parentWolrdMatrix, localMatrix);
        else this.worldMatrix = localMatrix;

        let worldMatrix = this.worldMatrix;
        this.children.forEach((child) => {
            child.updateWorldMatrix(worldMatrix);
        })
    }

    getCordsInObjectSpace = (inverseObjectMatrix) => {
        let objectSpaceMatrix = utils.multiplyMatrices(inverseObjectMatrix, this.worldMatrix);
        return utils.multiplyMatrixVector(objectSpaceMatrix, [this.localCords.x, this.localCords.y, this.localCords.z, 1.0]);
    }
}