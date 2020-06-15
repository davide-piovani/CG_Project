class ElectronAnimation {
    radius; calculatePos; v;

    constructor(r, func) {
        this.radius = r;
        this.calculatePos = func;
        this.v = assetsData[AssetType.ELECTRON].other.electron_velocity / 1000;
    }

    getPosAtTime = (t) => {
        let perc = this.v * t;
        return this.calculatePos(perc, this.radius);
    }
}