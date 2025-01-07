import * as THREE from 'three';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui'

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up OrbitControls for camera movement
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true; // Smooth camera movement
orbitControls.dampingFactor = 0.05;
orbitControls.minDistance = 2; // Set minimum zoom distance
orbitControls.maxDistance = 10; // Set maximum zoom distance

// Function to create a tetrahedron with solid color and visible black edges
function createTetrahedron(addEdges=false, position=new THREE.Vector3(0, 0, 0), size=1, color=0xffffff) {
    // Create the tetrahedron geometry
    const geometry = new THREE.TetrahedronGeometry(size);

    // Create the solid color material
    const material = new THREE.MeshBasicMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);

    // Add the tetrahedron to the scene
    mesh.position.copy(position);
    scene.add(mesh);

    if(addEdges) {
        const edges = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const edgeLines = new THREE.LineSegments(edges, edgesMaterial);
        edgeLines.position.copy(position);
        scene.add(edgeLines);
    }

    return mesh;
}

// Recursive function to generate layers of tetrahedrons
function generateTetrahedronLayers(layers, baseTetrahedron, size=1, color=0xffffff) {
    if (layers === 0) return;

    baseTetrahedron.visible = false;

    // Access the vertices of the base tetrahedron
    const baseGeometry = new THREE.TetrahedronGeometry(size);
    const positions = baseGeometry.attributes.position.array;

    // Extract the bottom vertices (skip the first vertex, which is the top)
    const baseVertices = [];
    for (let i = 3; i < positions.length; i += 3) {
        const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        baseVertices.push(vertex);
    }

    // Attach smaller tetrahedrons at the bottom vertices
    baseVertices.forEach((vertex) => {
        const worldPosition = vertex.add(baseTetrahedron.position);
        const newTetrahedron = createTetrahedron(layers===1, worldPosition, size, color);
        generateTetrahedronLayers(layers-1, newTetrahedron, size, color);
    });
}

function regenerateScene(){

    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }
    if(guiParams.Recursion_Order === 0){
        createTetrahedron(true);
    }else{
        generateTetrahedronLayers(guiParams.Recursion_Order, createTetrahedron())
    }
}

const gui = new GUI()
const guiParams = { Recursion_Order: 3 };
gui.add(guiParams, 'Recursion_Order', 0, 5, 1).onChange(()=>{
    regenerateScene();
})

// Position the camera and start rendering
camera.position.set(3, 3, 5);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene, camera);
}

generateTetrahedronLayers(3, createTetrahedron());
animate();