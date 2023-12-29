import React, { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as t from 'three';
import * as CountryData from '../assets/countryLocations.json';
import GlobeRaycaster from './globe/GlobeRaycaster';
import '../style/App.css'

const CLOUDS_IMG_URL = '../assets/clouds.png';
const CLOUDS_ALT = 0.004;
const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame
const EARTH_RADIUS_KM = 6371; // km
  const SAT_SIZE = 80; // km

const GlobeComponent = () => {
    const globeEl = useRef<any>(null);
    const shapes: t.Mesh<t.BufferGeometry<t.NormalBufferAttributes>, t.MeshBasicMaterial, t.Object3DEventMap>[] = [];
    const pledges: t.Mesh<t.OctahedronGeometry, t.MeshLambertMaterial, t.Object3DEventMap>[] = [];

    useEffect(() => {
        if (!globeEl.current) return;
        const isMobile = window.innerWidth <= 768;

        const globe = globeEl.current;
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.35;
        globe.controls().enableRotate = false;
        globe.controls().enableZoom = false;
        globe.controls().enablePan = false;
        if(isMobile) {
            globe.camera().position.set(0, 0, 900);
        } else {
            globe.camera().position.set(0, 0, 600);
        }
        globe.camera().lookAt(globe.scene().position);

        new t.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
            const clouds = new t.Mesh(
                new t.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
                new t.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
            );
            globe.scene().add(clouds);

            (function rotateClouds() {
                clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
                requestAnimationFrame(rotateClouds);
            })();
        });
        
        //Base indicer to iterate upon
        const mouse = new t.Vector2();
        const globeRadius = globe.getGlobeRadius();
        const globeRaycaster = new GlobeRaycaster(globe.getGlobeRadius(), shapes);
        const icosahedronGeometry = new t.IcosahedronGeometry(globeRadius * 1.5, 3);
        const icosahedronMaterial = new t.MeshBasicMaterial({ color: 0xff0000, wireframe: true, opacity: 0, transparent: true });
        const icosahedron = new t.Mesh(icosahedronGeometry, icosahedronMaterial);
        globe.scene().add(icosahedron);

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
            const triangleMaterialAct = new t.MeshPhongMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.0001, transparent: true, side: t.DoubleSide});
            const shapeMesh = new t.Mesh(shapeGeometry, triangleMaterialAct);
            shapes.push(shapeMesh);
            globe.scene().add(shapeMesh);
        });
        globe.scene().remove(icosahedron);

        
        const eventSource = new EventSource(process.env.REACT_APP_FEED_SERVICE_URL);
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received data:', data);
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
        };

        fetch(process.env.REACT_APP_GLOBE_INIT_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(countries => {
            console.log(countries);
            countries.forEach((listing: { location: { countryName: { location: { countryName: any; }; name: any; }; }; }) => {
                activateCountry(listing); 
            })
            countries.forEach((listing: { location: { countryName: { location: { countryName: any; }; name: any; }; }; }) => {
                activateCountry(listing); 
            })
            countries.forEach((listing: { location: { countryName: { location: { countryName: any; }; name: any; }; }; }) => {
                activateCountry(listing); 
            })
            countries.forEach((listing: { location: { countryName: any; }; name: any; }) => {
                activateCountry(listing); 
            })
        })
        .catch(error => {
            console.error('Failed to fetch initial globe data:', error);
        });

        const activateCountry = (listing: { location: { countryName: string; }; name: any; }) => {
            console.log(listing);
            const countryName = listing.location.countryName;
            console.log("country: ", countryName);
            const coords = getCoordinatesByCountry(countryName);
            const pledgerName = listing.name;
            activateGridAtCoordinates(coords?.latitude, coords?.longitude);
            createParticleAtCoordinate(coords, pledgerName);
        }     

        const getCoordinatesByCountry = (countryName: string): { latitude: number, longitude: number } | null => {
            const searchName = countryName.toLowerCase();
            const countryKey = Object.keys(CountryData).find(key => key.toLowerCase() === searchName);
            if (countryKey) {
              return CountryData[countryKey as keyof typeof CountryData]; // Type assertion
            } else {
                console.error("no country found");
                return null
            }
          };
        
          const createParticleAtCoordinate = (coords: { latitude: number, longitude: number } | null, pledgerName: string) => {
            if(coords){
                const randomOffset = () => (Math.random() - 0.5) * 100; // Adjust the multiplier for larger or smaller offset

                // Adjusted position with some randomness
                const position = globeEl.current.getCoords(
                    coords.latitude + randomOffset(), 
                    coords.longitude + randomOffset(), 
                    (globeRadius * 0.008) + (Math.random() * 0.008) // Adding randomness to altitude
                );

                console.log("position", position);
                const satGeometry = new t.OctahedronGeometry(SAT_SIZE * globeRadius / EARTH_RADIUS_KM , 0); 
                const satMaterial = new t.MeshLambertMaterial({ color: 'gold', transparent: true, opacity: 0.7 });
                const octahedron = new t.Mesh(satGeometry, satMaterial);
                octahedron.userData.pledgerName = pledgerName; // Replace with actual name
                octahedron.position.copy(position);
                globe.scene().add(octahedron);
                pledges.push(octahedron);
            }
          };

          const activateGridAtCoordinates = (targetLatitude: any, targetLongitude: any) => {
            const activateTriangle = (triangle) => {
                // Increase opacity
                triangle.material.opacity = Math.min(triangle.material.opacity + 0.0080, 0.1);
                
                // Check if triangle is fully opaque
                if (triangle.material.opacity < 0.1) {
                    return; // Stop if not fully opaque
                }
        
                // Mark triangle as activated
                triangle.userData.activated = true;
        
                // Activate adjacent triangles
                const adjacentTriangles = globeRaycaster.findAdjacentTriangles(triangle);
                adjacentTriangles.forEach(adjTriangle => {
                    if (!adjTriangle.userData.activated) {
                        activateTriangle(adjTriangle); // Recursive call
                    }
                });
            };
        
            const position = globeEl.current.getCoords(targetLatitude, targetLongitude, globeEl.current.getGlobeRadius());
            const intersectedObject = globeRaycaster.findTriangleByVector(position);
            if (intersectedObject) {
                activateTriangle(intersectedObject);
            }

            const onMouseMove = (event: { clientX: number; clientY: number; }) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                globeRaycaster.checkIntersections(mouse, globe.camera, pledges, event.clientX, event.clientY);   
            };
            window.addEventListener('mousemove', onMouseMove);              

            return () => { window.removeEventListener('mousemove', onMouseMove);}
        };
    }, []);
    return (
        <div>
            <div id="tooltip" style={{position: "absolute", display: "none"}}></div>
            <Globe
                ref={globeEl}
                animateIn={false}
                backgroundImageUrl="//unpkg.com/three-globe@2.30.0/example/img/night-sky.png"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                />
        </div>
    );
}
export default GlobeComponent;

interface CountryCoordinates {
    [key: string]: {
      latitude: number;
      longitude: number;
    };
}
