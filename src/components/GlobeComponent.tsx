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
    const [hoveredPledge, setHoveredPledge] = useState<any>(null);
    const [pledgeScreenPosition, setPledgeScreenPosition] = useState({ x: 0, y: 0 });
    const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
    const [pledgesReady, setPledgesReady] = useState(false);

    const pledgeArcsMap = new Map();

    const isMobile = window.innerWidth <= 768;

    const globeEl = useRef<any>(null);
    const shapes = useRef<t.Mesh<t.BufferGeometry<t.NormalBufferAttributes>, t.MeshStandardMaterial, t.Object3DEventMap>[]>([]);
    const pledges: t.Mesh<t.OctahedronGeometry, t.MeshStandardMaterial, t.Object3DEventMap>[] = [];
    const clock = new t.Clock();
    let targetScaleVector = new t.Vector3();


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

    const createArcsForPledges = () => {
        const globeRaycaster = new GlobeRaycaster(getGlobeRadius(), shapes.current);
        getCurrentScene().children.forEach(child => {
            if(child.userData.isPledge === true){
                if(!child.userData.arcs.length > 0){
                    const triangleVertices = globeRaycaster.getTriangleVerticesBelow(child.position, shapes.current);
                    if(triangleVertices){
                        const arcs = createArcsForHoveredParticle(child, triangleVertices);
                        child.userData.arcs = arcs;
                        pledgeArcsMap.set(child, arcs); // Store the association
                    }
                }
            }
        });
    }
      
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

    // const loadCloudsTexture = (globe: { getGlobeRadius: () => number; }) => {
    //     new t.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
    //         const clouds = new t.Mesh(
    //             new t.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
    //             new t.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    //         );
    //         getCurrentScene().add(clouds);

    //         (function rotateClouds() {
    //             clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
    //             //requestAnimationFrame(rotateClouds);
    //         })();
    //     });
    // }

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
                shapes.current.push(shapeMesh);
                scene.add(shapeMesh);
            });
            icosahedron.geometry.dispose();
            icosahedron.material.dispose();
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
        const raycaster = new GlobeRaycaster(getGlobeRadius, shapes.current);
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
            let position;
    
            // Find the triangle below the given coordinates
            const globeRaycaster = new GlobeRaycaster(getGlobeRadius(), shapes.current);
            const targetPosition = globeEl.current.getCoords(coords.latitude, coords.longitude, getGlobeRadius());
            const intersectedTriangle = globeRaycaster.findTriangleByVector(targetPosition);
    
            if (intersectedTriangle && !intersectedTriangle.userData.firstPledgeCreated) {
                // No offset for the first pledge
                position = targetPosition;
            } else {
                // Apply random offset for subsequent pledges
                const randomOffset = () => (Math.random() - 0.5) * 20;
                position = globeEl.current.getCoords(
                    coords.latitude + randomOffset(),
                    coords.longitude + randomOffset(),
                    (getGlobeRadius() * 0.01) + (Math.random() * 0.001)
                );
            }
    
            const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
            const sphereGeometry = new t.SphereGeometry(SAT_SIZE * getGlobeRadius() / EARTH_RADIUS_KM, 32, 32);
            const sphereMaterial = new t.MeshStandardMaterial({ color: randomColor, transparent: true, opacity: 0.7 });
    
            const sphere = new t.Mesh(sphereGeometry, sphereMaterial);

            sphere.userData = {
                fullName: pledgeObj.name,
                isHovered: false,
                isPledge: true,
                originalColor: randomColor,
                location:{
                    countryCodeISO: pledgeObj.location.countryCodeISO
                },
                seederInformation: {
                    uploadRate: Math.floor(Math.random() * 100),
                    downloadRate: Math.floor(Math.random() * 100),
                    cpuShared: Math.floor(Math.random() * 100),
                    ramShared: Math.floor(Math.random() * 100),
                    carbonSecured: Math.random() * 10
                },
                arcs:[]
            };
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
                if(!triangle.userData.activated){
                triangle.userData.firstPledgeCreated = true;
                triangle.material.opacity = 0.3; // Initial opacity for first pledge
                isFirstPledgeActivation = false; // Reset the flag after first activation
                triangle.userData.originalOpacity = triangle.material.opacity; // Save original opacity
                }
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
    };

    const animateCustomLayers = useCallback((scene: { children: any[] }) => {
        const scaleSpeed = 0.5;
        const baseScale = 1; // Base scale for non-hovered pledges
        const hoverScale = 5; // Maximum scale when hovered
        const amplitude = 0.2; // Amplitude of size pulsation
        const minIntensity = 1; // Minimum intensity to avoid disappearing
        const intensityRange = 0.5; // Range of intensity variation

        const pulseFactor = Math.sin(clock.getElapsedTime() * 3);
        const intensity = minIntensity + intensityRange * pulseFactor;

        scene.children.forEach((child) => {
            if (child.userData?.isPledge) {

                const isHovered = child.userData.isHovered;
                let linkedTriangle = child.userData.linkedTriangle;

                // Handle arcs and triangles if hovered
                if (isHovered) {
                    throttledUpdatePledgeScreenPosition(child);
                    const hoverColor = new t.Color(child.userData.hoverColor || child.userData.originalColor);

                    // Calculate scale and apply it
                    const targetScale = isHovered ? (hoverScale + amplitude * pulseFactor) : baseScale;
                    targetScaleVector.set(targetScale, targetScale, targetScale);
                    child.scale.lerp(targetScaleVector, scaleSpeed);

                    // Update material color
                    child.material.color.set(hoverColor.multiplyScalar(intensity));

                    //activate arcs for current hovered
                    const associatedArcs = pledgeArcsMap.get(child) || [];
                    associatedArcs.forEach(arc => {

                        arc.visible = true; // Update visibility based on hover state
                        arc.userData.isPulsating = true;

                        // Update color and intensity if visible
                        const intensity = minIntensity + intensityRange * Math.sin(clock.getElapsedTime() * 3);
                        arc.material.color.set(hoverColor.multiplyScalar(intensity));

                    });

                    //activate triangles
                    if (child.userData.linkedTriangle && child.userData.linkedTriangle) {
                        linkedTriangle.material.color.set(hoverColor.multiplyScalar(minIntensity + intensityRange * pulseFactor));
                        linkedTriangle.material.wireframe = false; // Fill the triangle
                    }

                } else {

                    //stop arcs pulsate and visibility
                    const associatedArcs = pledgeArcsMap.get(child) || [];
                    associatedArcs.forEach(arc => {
                        arc.visible = false;
                        arc.userData.isPulsating = false; // Update visibility based on hover state
                    });

                    //reset triangles
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoveredPledge]);

    const applyHoverEffects = (pledge: t.Mesh<t.OctahedronGeometry, t.MeshStandardMaterial, t.Object3DEventMap>) => {
        const globeRaycaster = new GlobeRaycaster(getGlobeRadius(), shapes.current);
        //pledge scale up and down
        pledge.userData.isHovered = true;
        //arcs pulsating in pledge color
        pledge.userData.isPulsating = true;
        //triangles below pulsating with arcs
        const triangleBelow = globeRaycaster.getTriangleBelow(pledge.position, shapes.current);
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
        pledge.scale.set(1,1,1);

        //kill triangles pulsate
        if (pledge.userData.linkedTriangle) {
            pledge.userData.hoverColor = pledge.userData.originalColor; // Store hover color
            pledge.userData.linkedTriangle.material.wireframe = true;
            pledge.userData.linkedTriangle.material.opacity = pledge.userData.linkedTriangle.userData.originalOpacity;
            pledge.userData.linkedTriangle.material.color.set(new t.Color(0xFFFFFF));
            pledge.userData.linkedTriangle = null;
        }
    };

    const updatePledgeHoverState = (newHoveredPledge: t.Object3D<t.Object3DEventMap> | null) => {
        // Iterate over pledges and update the hover state
        getCurrentScene().children.forEach(pledge => {
            if (pledge === newHoveredPledge) {
                // Apply hover effects and mark as hovered
                applyHoverEffects(pledge);
            } else if (pledge.userData.isHovered) {
                // Reset hover effects and mark as not hovered
                resetHoverEffects(pledge);
            }
        });
    };
    
    const cyclePledges = () => {
        const pledgeList = getCurrentScene().children
            .filter((child) => child.userData?.isPledge)

        if (pledgeList.length > 0) {
            const newIndex = (currentShapeIndex + 1) % pledgeList.length;
            setCurrentShapeIndex(newIndex);
            const newHoveredPledge = pledgeList[newIndex];
            updatePledgeHoverState(newHoveredPledge);
            setHoveredPledge(newHoveredPledge);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(cyclePledges, 5000); // Change interval as need
        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoveredPledge]);


    useEffect(() => {
        // Setup
        if (!globeEl.current) return;

        //loadCloudsTexture(globeEl.current);
        setupGlobe(globeEl.current, getCurrentScene());
        setupGridGeometry(globeEl.current, getCurrentScene());
        fetchAndActivateCountries()
        setPledgesReady(true); // Indicate that pledges are ready

        let animationFrameId: number;
        // Define the animation function
        animationFrameId = window.requestAnimationFrame(() => animateCustomLayers(getCurrentScene()));

        // Cleanup
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);


    useEffect(() => {
        
        let animationFrameId: number;
        animationFrameId = window.requestAnimationFrame(() => animateCustomLayers(getCurrentScene()));

        // Check if pledges are ready and create arcs
        const checkInterval = setInterval(() => {
            const scene = getCurrentScene();
            
            if (scene && scene.children.some(child => child.userData.isPledge)) {
                createArcsForPledges();
                clearInterval(checkInterval);
            }
        }, 500); // Check every 500 ms

        // Cleanup
        return () => {
            clearInterval(checkInterval);
            window.cancelAnimationFrame(animationFrameId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        if (sseData && sseData.location && sseData.location.countryName) {
            const countryName = sseData.location.countryName;
            const coords = getCoordinatesByCountry(countryName);

            if (coords) {
                // Create a particle at the new coordinates
                createParticleAtCoordinate(coords, sseData);

                // Activate the country on the globe
                const raycaster = new GlobeRaycaster(getGlobeRadius, shapes.current);
                activateCountry(sseData);
                activateGridAtCoordinates(coords.latitude, coords.longitude, raycaster);
                //TODO("add arc creation for new particles")
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sseData]);


    return (
        <>
        { (hoveredPledge) && (
            <div
                style={{
                    display: 'block',
                    position: 'absolute',
                    left: `${pledgeScreenPosition.x}px`,
                    top: `${pledgeScreenPosition.y}px`,
                    zIndex: '10',
                }}>
                <SeederComponent pledge={hoveredPledge} />
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
