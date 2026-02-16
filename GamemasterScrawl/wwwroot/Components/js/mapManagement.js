import {loadComponent} from "../../router.js";
import { toastUser } from "../../app.js";
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

//The reference to the library managing 3D stuff
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

 const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

// Tinkercad-style settings:
controls.enableDamping = true; // Adds that smooth "weight" to the movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true; // Allows moving up/down/left/right relative to the camera view


export async function init(container, appState){

const returnHomeBtn = container.querySelector("#returnHome");
  
returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

    Generate3DSpace(container);
}



async function Generate3DSpace(container, appState){

        renderer.setClearColor(0x000000, 0); // transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

    var spaceCont = container.querySelector("#Space3D");

    spaceCont.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry(1,1,1);
        // Initialize the Texture Loader
const loader = new THREE.TextureLoader();

        //const texture1 = loader.load("/Components/FileMaterials/Materials/Default_Asphalt.jpg");
        const texture1 = loader.load("/Components/FileMaterials/TokenImages/creepy-cat.webp");
        //Be sure to credit: https://ambientcg.com/

        const material = new THREE.MeshBasicMaterial({map: texture1});
        //const material = new THREE.MeshBasicMaterial({color: 0x3688F4});

        var i = 0;

const edges = new THREE.EdgesGeometry(geometry);
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

for (let i = 0; i < 10; i++) {
    for (let k = 0; k < 10; k++) {

        const cube = new THREE.Mesh(geometry, material);

        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        cube.add(edgeLines);

        cube.position.set(i, k, 0);
        scene.add(cube);
    }
}
        camera.position.z = 15;

        function animate() {
            controls.update(); // Only required if enableDamping is true


    renderer.render(scene, camera);
}

renderer.setAnimationLoop( animate );

}