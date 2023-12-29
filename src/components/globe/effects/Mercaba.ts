import THREE from "three";

const createMerkabahAboveLocation = (globe: { getGlobeRadius: () => any; scene: () => { (): any; new(): any; add: { (arg0: THREE.Object3D<THREE.Object3DEventMap>): void; new(): any; }; }; }, latitude: number, longitude: number, altitude: any) => {
    const globeRadius = globe.getGlobeRadius();
    const position = latLonToVector3(latitude, longitude, globeRadius + altitude);

    // Create tetrahedra to form Merkaba
    const tetraGeometry = new THREE.TetrahedronGeometry(globeRadius * 0.05); // Smaller size for Merkaba
    const tetraMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: false });
    const tetra1 = new THREE.Mesh(tetraGeometry, tetraMaterial);
    const tetra2 = new THREE.Mesh(tetraGeometry, tetraMaterial);
    tetra2.rotation.y = Math.PI / 2;

    // Create an Object3D to hold the tetrahedra
    const merkaba = new THREE.Object3D();
    merkaba.add(tetra1);
    merkaba.add(tetra2);

    // Position and rotate Merkaba
    merkaba.position.set(position.x, position.y, position.z);
    merkaba.rotation.x = Math.PI / 3;

    globe.scene().add(merkaba);
};

function latLonToVector3(lat: number, lon: number, radius: number) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

export default createMerkabahAboveLocation;