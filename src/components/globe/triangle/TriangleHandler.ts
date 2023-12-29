import * as t from 'three';
import GlobeHandler from '../GlobeHandler';

class TriangleHandler {
    shapes: any[];
    globeHandler: GlobeHandler;

    constructor(globe: any) {
        this.shapes = [];
        this.globeHandler = new GlobeHandler(globe);
    }

    createIcosahedron(globeRadius: number) {
        const icosahedronGeometry = new t.IcosahedronGeometry(globeRadius * 1.5, 3);
        const icosahedronMaterial = new t.MeshBasicMaterial({ color: 0xff0000, wireframe: true, opacity: 0, transparent: true });
        const icosahedron = new t.Mesh(icosahedronGeometry, icosahedronMaterial);
        this.globeHandler.globe.scene.add(icosahedron);
    }

    createShapes() {
        const icosahedronGeometry = new t.IcosahedronGeometry(this.globeHandler.getGlobeRadius() * 1.5, 3);
        const shapeIndices: number[][] = [];

        function addTriangle(v1: number, v2: number, v3: number) {
            shapeIndices.push([v1, v2, v3]);
        }

        const numVertices = icosahedronGeometry.attributes.position.count;

        for (let i = 0; i < numVertices; i += 3) {
            addTriangle(i, i + 1, i + 2);
        }

        shapeIndices.forEach((indices) => {
            const shapeGeometry = new t.BufferGeometry();
            const positions: number[] = [];
            const normals: number[] = [];

            indices.forEach(index => {
                const position = icosahedronGeometry.attributes.position.array.slice(index * 3, (index + 1) * 3);
                const normal = icosahedronGeometry.attributes.normal.array.slice(index * 3, (index + 1) * 3);

                positions.push(...position);
                normals.push(...normal);
            });

            shapeGeometry.setAttribute('position', new t.BufferAttribute(new Float32Array(positions), 3));
            shapeGeometry.setAttribute('normal', new t.BufferAttribute(new Float32Array(normals), 3));

            const icosahedronMaterial2 = new t.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.001, transparent: true });

            const shapeMesh = new t.Mesh(shapeGeometry, icosahedronMaterial2);
            this.shapes.push(shapeMesh);
            this.globeHandler.globe.scene.add(shapeMesh);
        });
    }

    activateTriangle() {
        // Activate a triangle and its surrounding triangles
    }

    findTriangleByCoordinates(latitude: any, longitude: any) {
        // Implement logic to map lat/lon to a triangle
        // Return the identified triangle or null if not found
    }
    
}
export default TriangleHandler;
