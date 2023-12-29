import * as t from 'three';

class GlobeRaycaster {
    raycaster: t.Raycaster;
    intersectionPoint: t.Vector3;
    globeRadius: any;
    shapes: t.Mesh<t.BufferGeometry<t.NormalBufferAttributes>, t.MeshBasicMaterial, t.Object3DEventMap>[];

    constructor(globeRadius: any, shapes: any) {
        this.raycaster = new t.Raycaster();
        this.intersectionPoint = new t.Vector3();
        this.globeRadius = globeRadius;
        this.shapes = shapes;
    }

    // Convert latitude and longitude to 3D position
    latLonToPosition(targetLatitude: number, targetLongitude: number) {
        // Convert latitude and longitude from degrees to radians
        const latRad = (90 - targetLatitude) * (Math.PI / 180); // Convert to radians
        const lonRad = targetLongitude * (Math.PI / 180); // Convert to radians
        
        // Calculate 3D position on the sphere (North Pole)
        const x = this.globeRadius * Math.sin(latRad) * Math.cos(lonRad);
        const y = this.globeRadius * Math.sin(latRad) * Math.sin(lonRad);
        const z = this.globeRadius * Math.cos(latRad);
        
        const position = new t.Vector3(x, y, z);
        console.log(position);
        return position;
    }

    checkIntersections(mouse: t.Vector2, camera: any, objects: t.Object3D<t.Object3DEventMap>[] | undefined, mousex: number, mousey: number){
        this.raycaster.setFromCamera(mouse, camera());
        if(objects){
            const intersects = this.raycaster.intersectObjects(objects);
            if (intersects.length > 0) {
                const pledgerName = intersects[0].object.userData.pledgerName;
                this.showTooltip(pledgerName, mousex, mousey);
            } else {
                this.hideTooltip();
            }
        }
    };

    showTooltip(name: string, x: number, y: number){
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.textContent = name;
            tooltip.style.display = 'block';
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            tooltip.style.color = '#FFF'
            tooltip.style.backgroundColor = '#000'
        }
    };

    hideTooltip(){
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
          tooltip.style.display = 'none';
        }
    };

    findTriangleByVector(locationArray :{x: number, y: number, z: number}) {
        const startPosition = new t.Vector3(locationArray.x, locationArray.y, locationArray.z);
        const direction = new t.Vector3(0, 0, 0).sub(startPosition).normalize();
        this.raycaster.set(startPosition, direction); // Cast upwards
        console.log(this.raycaster)
        const intersects = this.raycaster.intersectObjects(this.shapes);

        if (intersects.length > 0) {
            this.intersectionPoint.copy(intersects[0].point);
            console.log("intersects", intersects[0].object);
            return intersects[0].object; // The closest triangle
        } else {
            console.log("No intersections found.");
            return null; // No intersections
        }
    }

    findAdjacentTriangles(targetTriangle: t.Object3D<t.Object3DEventMap>) {
        const adjacentTriangles: any[] = [];

        // Loop through all other triangle meshes
        this.shapes.forEach((otherTriangleMesh) => {
            if (otherTriangleMesh !== targetTriangle) {
                // Check if the current triangle shares any vertices with the other triangle
                // You can implement this logic based on your specific mesh data structure
                // For example, if you have vertex indices for each triangle, you can compare them.
                if (this.trianglesShareVertices(targetTriangle, otherTriangleMesh)) {
                    adjacentTriangles.push(otherTriangleMesh);
                }
            }
        });
        return adjacentTriangles;
    }
    trianglesShareVertices(triangle1: t.Object3D<t.Object3DEventMap>, triangle2: t.Object3D<t.Object3DEventMap>) {
        // Get the vertices of each triangle
        const vertices1 = triangle1.geometry.attributes.position.array;
        const vertices2 = triangle2.geometry.attributes.position.array;
    
        // Check if any vertex of triangle1 is present in triangle2
        for (let i = 0; i < vertices1.length; i += 3) {
            const vertex1 = new t.Vector3(vertices1[i], vertices1[i + 1], vertices1[i + 2]);
    
            for (let j = 0; j < vertices2.length; j += 3) {
                const vertex2 = new t.Vector3(vertices2[j], vertices2[j + 1], vertices2[j + 2]);
    
                // Compare vertices using a small threshold for equality
                const threshold = 0.0001;
                if (vertex1.distanceTo(vertex2) < threshold) {
                    return true; // Found a shared vertex
                }
            }
        }
        return false; // No shared vertices found
    }
}

export default GlobeRaycaster;
