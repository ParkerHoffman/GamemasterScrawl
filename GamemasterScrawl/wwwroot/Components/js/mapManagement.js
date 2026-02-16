import {loadComponent} from "../../router.js";
import { toastUser } from "../../app.js";
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

//The reference to the library managing 3D stuff
import * as THREE from 'three';
import { make3DBlock } from "./helper3D.js";

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



for (let i = 0; i < 10; i++) {
    for (let k = 0; k < 10; k++) {

       const cube = make3DBlock("Default_Asphalt.jpg");

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