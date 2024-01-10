import ReactDOM from "react-dom";
import { BufferGeometry, Mesh, MeshBasicMaterial, NormalBufferAttributes, Object3D, Object3DEventMap, Raycaster, Vector2, Vector3 } from "three";
import SeederComponent from "../SeederComponent";

class GlobeRaycaster {
    raycaster: Raycaster;
    intersectionPoint: Vector3;
    globeRadius: any;
    shapes: Mesh<BufferGeometry<NormalBufferAttributes>, MeshBasicMaterial, Object3DEventMap>[];

    constructor(globeRadius: any, shapes: any) {
        this.raycaster = new Raycaster();
        this.intersectionPoint = new Vector3();
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
        
        const position = new Vector3(x, y, z);
        return position;
    }

    checkIntersections(mouse: Vector2, camera: any, objects: Object3D<Object3DEventMap>[] | undefined) {
        if (!objects) {
          return null;
        }
      
        this.raycaster.setFromCamera(mouse, camera);
      
        const intersects = this.raycaster.intersectObjects(objects);
      
        if (intersects.length > 0) {
          return intersects;
      } else { 
          return null;
      }
    }

    findTriangleByVector(locationArray :{x: number, y: number, z: number}) {
        const startPosition = new Vector3(locationArray.x, locationArray.y, locationArray.z);
        const direction = new Vector3(0, 0, 0).sub(startPosition).normalize();
        this.raycaster.set(startPosition, direction); // Cast upwards
        // console.log(this.raycaster)
        const intersects = this.raycaster.intersectObjects(this.shapes);

        if (intersects.length > 0) {
            this.intersectionPoint.copy(intersects[0].point);
            return intersects[0].object; // The closest triangle
        } else {
            return null; // No intersections
        }
    }

    findAdjacentTriangles(targetTriangle: Object3D<Object3DEventMap>) {
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

    trianglesShareVertices(triangle1: Object3D<Object3DEventMap>, triangle2: Object3D<Object3DEventMap>) {
        // Get the vertices of each triangle
        const vertices1 = triangle1.geometry.attributes.position.array;
        const vertices2 = triangle2.geometry.attributes.position.array;
    
        // Check if any vertex of triangle1 is present in triangle2
        for (let i = 0; i < vertices1.length; i += 3) {
            const vertex1 = new Vector3(vertices1[i], vertices1[i + 1], vertices1[i + 2]);
    
            for (let j = 0; j < vertices2.length; j += 3) {
                const vertex2 = new Vector3(vertices2[j], vertices2[j + 1], vertices2[j + 2]);
    
                // Compare vertices using a small threshold for equality
                const threshold = 0.0001;
                if (vertex1.distanceTo(vertex2) < threshold) {
                    return true; // Found a shared vertex
                }
            }
        }
        return false; // No shared vertices found
    }

    getTriangleVerticesBelow(particlePosition, shapes) {
        const direction = new Vector3(0, 0, 0).sub(particlePosition).normalize(); // Ray pointing towards the globe center
        this.raycaster.set(particlePosition, direction);
    
        // Debug: log the particle position and direction
        const intersects = this.raycaster.intersectObjects(shapes); // Ensure this intersects with your globe mesh
    
        if (intersects.length === 0) {
            return null; // No intersection with the globe
        }

    
        const closestIntersection = intersects[0];
        if (!closestIntersection || !closestIntersection.face) {
            console.log('No face found at intersection'); // Debug log
            return null; // No face found at intersection
        }
    
        const face = closestIntersection.face;
    
        // Ensure geometry and attributes are defined
        const geometry = closestIntersection.object.geometry;
        if (!geometry || !geometry.attributes.position) {
            console.log('Invalid geometry or position attribute'); // Debug log
            return null;
        }
    
        const positionAttribute = geometry.attributes.position;
    
        // Get vertices of the face (triangle)
        const vertexA = new Vector3().fromBufferAttribute(positionAttribute, face.a);
        const vertexB = new Vector3().fromBufferAttribute(positionAttribute, face.b);
        const vertexC = new Vector3().fromBufferAttribute(positionAttribute, face.c);
    
        // Transform vertices to world space
        vertexA.applyMatrix4(closestIntersection.object.matrixWorld);
        vertexB.applyMatrix4(closestIntersection.object.matrixWorld);
        vertexC.applyMatrix4(closestIntersection.object.matrixWorld);
    
        return [vertexA, vertexB, vertexC];
    };
    
    getTriangleBelow(pledgePosition, shapes) {
        // Calculate the direction from the pledge to the center of the globe
        const direction = new Vector3().subVectors(new Vector3(0, 0, 0), pledgePosition).normalize();
    
        // Set the raycaster
        this.raycaster.set(pledgePosition, direction);
    
        // Check for intersections with all triangles
        const intersections = this.raycaster.intersectObjects(shapes);
    
        // Return the first intersected triangle, if any
        return intersections.length > 0 ? intersections[0].object : null;
    };
    
}

export default GlobeRaycaster;
