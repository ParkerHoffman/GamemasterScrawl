import {loadComponent} from "../../router.js";
import { toastUser } from "../../app.js";

//The reference to the library managing 3D stuff
import * as THREE from 'three';

//Setting up stuff for the ROTATING CUBE OF OMINOUS INTENT
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Initialize the Texture Loader
const loader = new THREE.TextureLoader();

export function init(container, appState){
//If user is the host
if(appState.isHost == true){
    //The holder for the UM Navigator Button
    const manageBtn = container.querySelector("#userManagementHolder");

    manageBtn.innerHTML = "<button id=\"openUserManagement\" class=\"info\">User Management</button><button id=\"openMapManagement\" class=\"info\">Map Editor</button>";
    //The button itself
    const usrMangBtn = container.querySelector("#openUserManagement");
  
    usrMangBtn.addEventListener("click", async () => {loadComponent("userManagement")});

        //The button itself
    const mapMangBtn = container.querySelector("#openMapManagement");
  
    mapMangBtn.addEventListener("click", async () => {loadComponent("mapManagement")});
    
} else {
    const logOutBtn = container.querySelector("#LogoutButtonHolder");

        logOutBtn.innerHTML = "<button id=\"UserRequestsLogOut\" class=\"info\">Log Out</button>";
    //The button itself
    const usrlogOutBtn = container.querySelector("#UserRequestsLogOut");
  
    usrlogOutBtn.addEventListener("click", async () => {logUsrOut(appState)});

    
}
Generate3DSpace(container, appState)
}

//Logs the user out
async function logUsrOut(appState){
    //Tell the server the login creds for it to do it's magic
    var success = await appState.connection.invoke("LogUserOut");

        //If success isn't true we should already get toasted.
        //Or the user is host. Host should never use this, under any circumstances
        if(success === true){
            loadComponent("login");
        }
    
}


async function Generate3DSpace(container, appState){
 const renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 0); // transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

    var spaceCont = container.querySelector("#Space3D");

    spaceCont.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry(1,1,1);
        //const geometry = new THREE.IcosahedronGeometry();

        const texture1 = loader.load("/Components/FileMaterials/Materials/Default_Asphalt.jpg");
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

    let angle = 0;

        function animate() {
            angle += 0.002;

            camera.position.x = Math.cos(angle) * 10;
            camera.position.y = Math.sin(angle) * 10;
            camera.position.z = 15;
            camera.lookAt(5,5,5)

    renderer.render(scene, camera);
}

renderer.setAnimationLoop( animate );

}