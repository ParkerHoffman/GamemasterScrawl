import {loadComponent} from "../../router.js";
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { toastUser } from "../../app.js";

//The reference to the library managing 3D stuff
import * as THREE from 'three';
import { Generate3DSpace } from "./helper3D.js";

//Setting up stuff for the ROTATING CUBE OF OMINOUS INTENT
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

 const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

controls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.ROTATE,
    RIGHT: THREE.MOUSE.PAN
};

//Deals with block manipulation
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Tinkercad-style settings:
controls.enableDamping = true; // Adds that smooth "weight" to the movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true; // Allows moving up/down/left/right relative to the camera view

export function init(container, appState){
//If user is the host
if(appState.isHost == true){
    //The holder for the UM Navigator Button
    const manageBtn = container.querySelector("#userManagementHolder");

    manageBtn.innerHTML = "<button id=\"openUserManagement\" class=\"info\">User Management</button><button id=\"openMapManagement\" class=\"info\">Map Editor</button><button id=\"openTokenManagement\" class=\"info\">Token Editor</button>";
    //The button itself
    const usrMangBtn = container.querySelector("#openUserManagement");
  
    usrMangBtn.addEventListener("click", async () => {loadComponent("userManagement")});

        //The button itself
    const mapMangBtn = container.querySelector("#openMapManagement");
  
    mapMangBtn.addEventListener("click", async () => {loadComponent("mapManagement")});

    const tokenMangBtn = container.querySelector("#openTokenManagement");
  
    tokenMangBtn.addEventListener("click", async () => {loadComponent("tokenEditor")});
    
} else {
    const logOutBtn = container.querySelector("#LogoutButtonHolder");

        logOutBtn.innerHTML = "<button id=\"UserRequestsLogOut\" class=\"info\">Log Out</button>";
    //The button itself
    const usrlogOutBtn = container.querySelector("#UserRequestsLogOut");
  
    usrlogOutBtn.addEventListener("click", async () => {logUsrOut(appState)});
}
    Generate3DSpace(container, "#Space3D", appState, renderer, camera, scene, controls);
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