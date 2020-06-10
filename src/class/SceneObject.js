class SceneObject {
    x = 0.0; y = 0.0; z = 0.0; rx = 0.0; ry = 0.0; rz = 0.0; s = 1.0;
    assetType = null; animation = null; parent = null;

    setParams = ({geometry, assetType, animation, parent}) => {
        let geom;
        
        if (assetType) {
            this.assetType = assetType;
            geom = assets[assetType].geometry;
        } else {
            geom = geometry;
        }

        if (geom) {
            if (geom.x) this.x = geom.x;
            if (geom.y) this.y = geom.y;
            if (geom.z) this.z = geom.z;
            if (geom.rx) this.rx = geom.rx;
            if (geom.ry) this.ry = geom.ry;
            if (geom.rz) this.rz = geom.rz;
            if (geom.s) this.s = geom.s;
        }
        
        if (animation) this.animation = animation;
        if (parent) this.parent = parent;
    };

    getWorldMatrix = () => {
        return utils.MakeWorld(this.x, this.y, this.z, this.rx, this.ry, this.rz, this.s);
    };
}