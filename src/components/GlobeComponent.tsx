import React, { useCallback, useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as t from 'three';
import * as CountryData from '../assets/countryLocations.json';
import GlobeRaycaster from './globe/GlobeRaycaster';
import '../style/App.css'
import { debounce, throttle } from 'lodash';
import SeederComponent from './SeederComponent';


const CLOUDS_IMG_URL = '../assets/clouds.png';
const CLOUDS_ALT = 0.004;
const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame
const EARTH_RADIUS_KM = 6371; // km
const SAT_SIZE = 80; // km

interface SSEData {
    name: string;
    email: string;
    location: {
      countryCodeISO: string;
      countryName: string;
    };
}
    
interface GlobeComponentProps {
    sseData: SSEData | undefined; // Allow undefined
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ sseData }) => {
    const [currentArcs, setCurrentArcs] = useState([]);
    const [hoveredPledge, setHoveredPledge] = useState<any>(null);
    const [pledgeScreenPosition, setPledgeScreenPosition] = useState({ x: 0, y: 0 });
    const [selectedPledge, setSelectedPledge] = useState(null);
    const [selectedPledgeIndex, setSelectedPledgeIndex] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const isMobile = window.innerWidth <= 768;

    const globeEl = useRef<any>(null);
    const shapes: t.Mesh<t.BufferGeometry<t.NormalBufferAttributes>, t.MeshStandardMaterial, t.Object3DEventMap>[] = [];
    const pledges: t.Mesh<t.OctahedronGeometry, t.MeshStandardMaterial, t.Object3DEventMap>[] = [];
    const clock = new t.Clock();
    
        
    const selectPledge = (pledge: React.SetStateAction<null> | t.Mesh<t.OctahedronGeometry, t.MeshStandardMaterial, t.Object3DEventMap>, index: React.SetStateAction<number>) => {
        setSelectedPledge(pledge);
        setSelectedPledgeIndex(index); // New state variable to track selected pledge index
        applyHoverEffects(pledge);
    };

    const throttledUpdatePledgeScreenPosition = throttle((pledge) => {
        if (pledge && !isMobile) {
            const vector = new t.Vector3();
            pledge.getWorldPosition(vector);
            vector.project(globeEl.current.camera());

            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

            setPledgeScreenPosition({ x, y });
        }
    }, 100); // Adjust the throttle time as needed

    const setupGlobe = (globe: any, scene: any) => {
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.35;
        globe.controls().enableRotate = false;
        globe.controls().enableZoom = false;
        globe.controls().enablePan = false;
        
        const isMobile = window.innerWidth <= 768;

        if(isMobile) {
            globe.camera().position.set(0, 0, 900);
        } else {
            globe.camera().position.set(0, 0, 600);
        }
        globe.camera().lookAt(globe.scene().position);
    }

    const loadCloudsTexture = (globe: { getGlobeRadius: () => number; }) => {
        new t.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
            const clouds = new t.Mesh(
                new t.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
                new t.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
            );
            getCurrentScene().add(clouds);

            (function rotateClouds() {
                clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
                requestAnimationFrame(rotateClouds);
            })();
        });
    }

    const setupGridGeometry = (globe: any, scene: any) => {
            const globeRadius = globe.getGlobeRadius();
            
            const icosahedronGeometry = new t.IcosahedronGeometry(globeRadius * 1.7, 3);
            const icosahedronMaterial = new t.MeshStandardMaterial({ color: 0xff0000, wireframe: true, opacity: 0, transparent: true, roughness: 0.2, metalness: 0.3 });
            const icosahedron = new t.Mesh(icosahedronGeometry, icosahedronMaterial);
            scene.add(icosahedron);
    
            // Manually define vertex indices for separate triangles
            const shapeIndices: number[][] = [];
            function addTriangle(v1: number, v2: number, v3: number) {
                shapeIndices.push([v1, v2, v3]);
            }
    
            // Calculate the total number of vertices in the icosahedron geometry
            const numVertices = icosahedronGeometry.attributes.position.count;
    
            // Divide the vertices into groups of three to form triangles
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
                const triangleMaterialAct = new t.MeshStandardMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.0001, transparent: true, side: t.DoubleSide});
                const shapeMesh = new t.Mesh(shapeGeometry, triangleMaterialAct);
                shapeMesh.userData.originalOpacity = shapeMesh.material.opacity; // Save original opacity
                shapeMesh.userData.originalWireframe = shapeMesh.material.wireframe; // Save original wireframe state
                shapes.push(shapeMesh);
                scene.add(shapeMesh);
            });
            scene.remove(icosahedron);    
    }
    
    const fetchAndActivateCountries = () => {
        fetch(process.env.REACT_APP_GLOBE_INIT_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(countries => {
            countries.forEach((listing: { location: { countryName: { location: { countryName: any; }; name: any; }; }; }) => {
                activateCountry(listing);
            })
        })
        .catch(error => {
            console.error('Failed to fetch initial globe data:', error);
        });
    }

    const activateCountry = (listing: { location: { countryName: string; countryCodeISO:string; }; name: any; }) => {
        const countryName = listing.location.countryName;
        const coords = getCoordinatesByCountry(countryName);
        const raycaster = new GlobeRaycaster(getGlobeRadius, shapes);
        activateGridAtCoordinates(coords?.latitude, coords?.longitude, raycaster);
        createParticleAtCoordinate(coords, listing);
    };     

    const getCoordinatesByCountry = (countryName: string): { latitude: number, longitude: number } | null => {
        const searchName = countryName.toLowerCase();
        const countryKey = Object.keys(CountryData).find(key => key.toLowerCase() === searchName);
        if (countryKey) {
          return CountryData[countryKey as keyof typeof CountryData]; // Type assertion
        } else {
            return null
        }
    };
    
    const createParticleAtCoordinate = (coords: { latitude: number, longitude: number } | null, pledgeObj: { location: { countryName: string; countryCodeISO:string; }; name: any; }) => {
        if (coords) {
            const randomOffset = () => (Math.random() - 0.5) * 20; // Adjust the multiplier for larger or smaller offset
            // Adjusted position with some randomness
            const position = globeEl.current.getCoords(
                coords.latitude + randomOffset(),
                coords.longitude + randomOffset(),
                (getGlobeRadius() * 0.01) + (Math.random() * 0.001) // Adding randomness to altitude
            );
            const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
            const sphereGeometry = new t.SphereGeometry(SAT_SIZE * getGlobeRadius() / EARTH_RADIUS_KM, 32, 32);
            const sphereMaterial = new t.MeshStandardMaterial({ color: randomColor, transparent: true, opacity: 0.7 });
    
            const sphere = new t.Mesh(sphereGeometry, sphereMaterial);

            sphere.userData = {
                fullName: pledgeObj.name,
                isHovered: false,
                location:{
                    countryCodeISO: pledgeObj.location.countryCodeISO
                },
                seederInformation: {
                    uploadRate: Math.floor(Math.random() * 100),
                    downloadRate: Math.floor(Math.random() * 100),
                    cpuShared: Math.floor(Math.random() * 100),
                    ramShared: Math.floor(Math.random() * 100),
                    carbonSecured: Math.random() * 10
                }
            };

            sphere.userData.isPledge = true;
            sphere.userData.originalColor = randomColor; // Store the original color
            sphere.position.copy(position);
            getCurrentScene().add(sphere);
            pledges.push(sphere);
        }
    };

    const createArc = (startPoint: t.Vector3, endPoint: t.Vector3) => {
        const midPoint = new t.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);

        // Displace the midpoint outward by increasing its length relative to the globe's center
        const globeCenter = new t.Vector3(0, 0, 0);
        const displacementFactor = 1.2; // Adjust this value as needed for curvature
        midPoint.sub(globeCenter).normalize().multiplyScalar(globeCenter.distanceTo(midPoint) * displacementFactor).add(globeCenter);
    
        midPoint.setLength(200); // Adjust the height of the arc
    
        const curve = new t.CatmullRomCurve3([startPoint, midPoint, endPoint], false, 'chordal');
        const geometry = new t.TubeGeometry(curve, 64, 0.2, 8, false);
        const material = new t.MeshStandardMaterial({ color: 0xffffff });
        const arc = new t.Mesh(geometry, material);
        arc.userData.isArc = true;
        arc.userData.isPulsing = true; // Flag to enable pulsing
        return arc;
    };
    
    const createArcsForHoveredParticle = (particle: { position: any; }, triangleVertices: any[]) => {
        const arcs = triangleVertices.map((vertex: any) => createArc(particle.position, vertex));
        arcs.forEach((arc: any) => getCurrentScene().add(arc)); // Add arcs to the scene
        return arcs;
    };

    const getCurrentScene = () => {
            return globeEl.current ? globeEl.current.scene() : null;
    };

    const getGlobeRadius = () => {
        return globeEl.current ? globeEl.current.getGlobeRadius() : 0;
    };
    
    const activateGridAtCoordinates = (targetLatitude: number | undefined, targetLongitude: number | undefined, globeRaycaster: GlobeRaycaster) => {
        let isFirstPledgeActivation = true; // Flag to check the first activation
    
        const activateTriangle = (triangle: { userData: { activated: boolean; originalOpacity: any; }; material: { opacity: number; }; }) => {
            // Increase opacity based on whether it's the first activation
            if (isFirstPledgeActivation && !triangle.userData.activated) {
                triangle.material.opacity = 0.3; // Initial opacity for first pledge
                isFirstPledgeActivation = false; // Reset the flag after first activation
                triangle.userData.originalOpacity = triangle.material.opacity; // Save original opacity
            } else {
                // Gradually increase opacity for subsequent activations
                triangle.material.opacity = Math.min(triangle.material.opacity + 0.0085, 0.1);
                triangle.userData.originalOpacity = triangle.material.opacity; // Save original opacity

            }
    
            // Check if triangle is fully opaque (for subsequent activations)
            if (triangle.material.opacity < 0.08 && !isFirstPledgeActivation ) {
                return; // Stop if not fully opaque
            }
    
            // Mark triangle as activated
            triangle.userData.activated = true;
    
            // Activate adjacent triangles
            const adjacentTriangles = globeRaycaster.findAdjacentTriangles(triangle);
            adjacentTriangles.forEach((adjTriangle: { userData: { activated: any; }; }) => {
                if (!adjTriangle.userData.activated) {
                    activateTriangle(adjTriangle); // Recursive call
                }
            });
        };
    
        const position = globeEl.current.getCoords(targetLatitude, targetLongitude, getGlobeRadius());
        const intersectedObject = globeRaycaster.findTriangleByVector(position);
        if (intersectedObject) {
            activateTriangle(intersectedObject);
        }
        // console.log("grid activated");
    };

    const animateCustomLayers = (scene: { children: never[]; add: (arg0: never) => void; remove: (arg0: any) => void; }) => {
        if (!scene || !scene.children) {
            return; // Ensure scene and its children are defined
        }
    
        const time = clock.getElapsedTime(); // Total elapsed time
        const pulseFactor = Math.sin(time * 3); // Pulsation factor for intensity
        const scaleSpeed = 0.5;
        const baseScale = 1; // Base scale for non-hovered pledges
        const hoverScale = 5; // Maximum scale when hovered
        const amplitude = 0.2; // Amplitude of size pulsation
        const minIntensity = 1; // Minimum intensity to avoid disappearing
        const intensityRange = 0.5; // Range of intensity variation
    
        scene.children.forEach((child: { userData: { isPledge: any; isHovered: any; hoverColor: any; originalColor: any; linkedTriangle: null; }; scale: { x: number; y: number; z: number; }; material: { color: { set: (arg0: t.Color) => void; }; }; }) => {
            if (child.userData && child.userData.isPledge) {
                const isHovered = child.userData.isHovered; 
                const hoverColor = new t.Color(child.userData.hoverColor || child.userData.originalColor);
                //let arcs = child.userData.arcs;
                let linkedTriangle = child.userData.linkedTriangle;
    
                // Pulsation in size when hovered
                const targetScale = isHovered ? (hoverScale + amplitude * pulseFactor) : baseScale;
                child.scale.x += (targetScale - child.scale.x) * scaleSpeed;
                child.scale.y += (targetScale - child.scale.y) * scaleSpeed;
                child.scale.z += (targetScale - child.scale.z) * scaleSpeed;
    
                // Default pulsation in intensity for all pledges
                const intensity = minIntensity + intensityRange * pulseFactor;
                child.material.color.set(hoverColor.multiplyScalar(intensity));
    
                // Pulsating arcs and triangle
                if (isHovered) {
                    throttledUpdatePledgeScreenPosition(child);
                    currentArcs.forEach(arc => {
                        if (!scene.children.includes(arc)) {
                            scene.add(arc);  // Add arc if not already in the scene
                        }
                        // Update arc properties if needed
                        arc.material.color.set(hoverColor.multiplyScalar(minIntensity + intensityRange * pulseFactor));
                    });
                    if (linkedTriangle && linkedTriangle.material) {
                        linkedTriangle.material.color.set(hoverColor.multiplyScalar(minIntensity + intensityRange * pulseFactor));
                        linkedTriangle.material.wireframe = false; // Fill the triangle
                    }
                } else {
                    // Remove any arcs that are no longer in the currentArcs state
                    scene.children.forEach((child: { userData: { isArc: any; }; geometry: { dispose: () => void; }; material: { dispose: () => void; }; }) => {
                        if (child.userData && child.userData.isArc && !currentArcs.includes(child)) {
                            scene.remove(child);
                            if (child.geometry) child.geometry.dispose();
                            if (child.material) child.material.dispose();
                        }
                    });
                    if (linkedTriangle) {
                        linkedTriangle.material.opacity = linkedTriangle.userData.originalOpacity;
                        linkedTriangle.material.wireframe = true; // Back to wireframe
                        linkedTriangle.material.color.set(new t.Color(0xFFFFFF)); // White color
                        child.userData.linkedTriangle = null;
                    }
                }
            }
        });
    
        window.requestAnimationFrame(() => animateCustomLayers(scene));
    };

    const handleIntersections = (mouse: t.Vector2) => {
        const raycaster = new GlobeRaycaster(getGlobeRadius(), pledges);
        const intersects = raycaster.checkIntersections(mouse, globeEl.current.camera(), pledges);
        if(intersects){
            return intersects.length > 0 ? intersects[0].object : null;
        }
        else{
            return null
        }
    };

    const applyHoverEffects = (pledge: t.Mesh<t.OctahedronGeometry, t.MeshStandardMaterial, t.Object3DEventMap>) => {
        const globeRaycaster = new GlobeRaycaster(getGlobeRadius(), shapes);
        //pledge scale up and down
        pledge.userData.isHovered = true;
        //arcs pulsating in pledge color
        pledge.userData.isPulsating = true;

        const triangleVertices = globeRaycaster.getTriangleVerticesBelow(pledge.position, shapes);
        if (triangleVertices) {
            const arcs = createArcsForHoveredParticle(pledge, triangleVertices);
            setCurrentArcs(arcs);
        }

        //triangles below pulsating with arcs
        const triangleBelow = globeRaycaster.getTriangleBelow(pledge.position, shapes);
        if (triangleBelow) {
            pledge.userData.linkedTriangle = triangleBelow;
        }
        pledge.userData.hoverColor = pledge.userData.originalColor;
        if (pledge.userData.linkedTriangle) {
            pledge.userData.linkedTriangle.material.color.set(new t.Color(pledge.userData.hoverColor));
        }
    };
    
    const resetHoverEffects = (pledge: t.Mesh<t.OctahedronGeometry, t.MeshStandardMaterial, t.Object3DEventMap>) => {

        //kill pledge scaling
        pledge.userData.isHovered = false;
        pledge.userData.isPulsating = false;
        //kill triangles pulsate
        if (pledge.userData.linkedTriangle) {
            pledge.userData.hoverColor = pledge.userData.originalColor; // Store hover color
            pledge.userData.linkedTriangle.material.wireframe = true;
            pledge.userData.linkedTriangle.material.opacity = pledge.userData.linkedTriangle.userData.originalOpacity;
            pledge.userData.linkedTriangle.material.color.set(new t.Color(0xFFFFFF));
            pledge.userData.linkedTriangle = null;
        }
        setCurrentArcs([]);
    };

    const updatePledgeHoverState = (newHoveredPledge: t.Object3D<t.Object3DEventMap> | null) => {
        // Iterate over pledges and update the hover state
        let isHoverChanged = false;
        pledges.forEach(pledge => {
            if (pledge === newHoveredPledge) {
                // Apply hover effects and mark as hovered
                applyHoverEffects(pledge);
                isHoverChanged = true;

            } else if (pledge.userData.isHovered) {
                // Reset hover effects and mark as not hovered
                resetHoverEffects(pledge);
                isHoverChanged = true;
            }
        });

        if(isHoverChanged){
            getCurrentScene().updateMatrixWorld(); // Update the scene
        }
    };

    const cyclePledges = () => {
        if (pledges.length === 0) {
            return;
        }
    
        let newIndex = selectedPledgeIndex + 1;
        if (newIndex >= pledges.length) {
            newIndex = 0;
        }
    
        const newPledge = pledges[newIndex];
        if (!newPledge) {
            return;
        }
    
        selectPledge(newPledge, newIndex);
    };
    
    const onMouseMove = useCallback(debounce((event) => {    
        if (selectedPledge) {
            // If a pledge is selected, ignore hover changes
            return;
        }
    
        const mouse = new t.Vector2();
        mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;
    
        const intersectedPledge = handleIntersections(mouse);
        if (intersectedPledge !== hoveredPledge) {
            setHoveredPledge(intersectedPledge);
            updatePledgeHoverState(intersectedPledge);
        }
    }, 50), [hoveredPledge, selectedPledge]);

    useEffect(() => {
        const handleMouseMove = (event: any) => onMouseMove(event);
        window.addEventListener('mousemove', handleMouseMove);
        window.requestAnimationFrame(() => animateCustomLayers(getCurrentScene()));
        const id = setInterval(cyclePledges, 5000);
        setIntervalId(id);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            clearInterval(id);
        }
    }, [onMouseMove, currentArcs, hoveredPledge, currentIndex, selectedPledgeIndex]);

    //Initialize Scene useEffect
    useEffect(() => {
        if (!globeEl.current) return;
        loadCloudsTexture(globeEl.current);
        setupGlobe(globeEl.current, getCurrentScene());
        setupGridGeometry(globeEl.current, getCurrentScene());
        fetchAndActivateCountries();
        window.requestAnimationFrame(() => animateCustomLayers(getCurrentScene()));
    }, []);
    
    //arc cleanup
    useEffect(() => {
        return () => {
            currentArcs.forEach(arc => {
                if (arc.geometry) arc.geometry.dispose();
                if (arc.material) arc.material.dispose();
            });
        };
    }, [currentArcs, hoveredPledge]);

    useEffect(() => {
        if (sseData && sseData.location && sseData.location.countryName) {
            const countryName = sseData.location.countryName;
            const coords = getCoordinatesByCountry(countryName);

            if (coords) {
                // Create a particle at the new coordinates
                createParticleAtCoordinate(coords, sseData);

                // Activate the country on the globe
                const raycaster = new GlobeRaycaster(getGlobeRadius, shapes);
                activateCountry(sseData);
                activateGridAtCoordinates(coords.latitude, coords.longitude, raycaster);
            }
        }
    }, [sseData]); // Dependency array includes sseData

    return (
        <>
        { (hoveredPledge || selectedPledge) && (
            <div
                style={{
                    display: 'block',
                    position: 'absolute',
                    left: `${pledgeScreenPosition.x}px`,
                    top: `${pledgeScreenPosition.y}px`,
                    zIndex: '10',
                }}>
                <SeederComponent pledge={hoveredPledge || selectedPledge} />
            </div>
        )}
        <Globe
            ref={globeEl}
            animateIn={false}
            // backgroundImageUrl="//unpkg.com/three-globe@2.30.0/example/img/night-sky.png"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            />
        </>
    );
}
export default GlobeComponent;
