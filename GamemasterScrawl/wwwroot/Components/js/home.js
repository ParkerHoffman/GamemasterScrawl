import {loadComponent} from "../../router.js";
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { toastUser } from "../../app.js";

//The reference to the library managing 3D stuff
import * as THREE from 'three';
import { Generate3DSpace, renderRoom } from "./helper3D.js";

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

var mapList = [];

var appState = null;
var container = null;
var currentActiveRoom = null;

export async function init(cont, app){
        appState = app;
        container = cont;

            Generate3DSpace(container, "#Space3D", appState, renderer, camera, scene, controls);

        var map = await appState.connection.invoke("GetMapList");
        currentActiveRoom = await appState.connection.invoke("GetGlobalActiveRoom");

        mapList = map.roomList;

        ChangeRoomGlobal(currentActiveRoom)
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


    renderFolderTree(mapList, onSelect, "#SpecialInteractables");
    
} else {
    const logOutBtn = container.querySelector("#LogoutButtonHolder");

        logOutBtn.innerHTML = "<button id=\"UserRequestsLogOut\" class=\"info\">Log Out</button>";
    //The button itself
    const usrlogOutBtn = container.querySelector("#UserRequestsLogOut");
  
    usrlogOutBtn.addEventListener("click", async () => {logUsrOut(appState)});


    appState.connection.on("SelectFreshGlobalRoom", (id) => ChangeRoomGlobal(id))
}
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

function ChangeRoomGlobal(id){
    currentActiveRoom = id;
    var currentRoom = mapList.filter((e) => e.id === id);
    console.log(currentRoom, id)
    if(currentRoom && currentRoom[0]){
        renderRoom(scene, currentRoom[0], true)
    }
}


async function onSelect(item){
    renderRoom(scene, item);
    await appState.connection.invoke("ChangeActiveRoom", item.id);
}

//This function creates (and updates) the file Tree
function renderFolderTree( data, onSelect, comp){
    const cont = container.querySelector(comp);

    cont.innerHTML = "";

    data.forEach(folder => {
        const folderDiv = document.createElement("div");
        folderDiv.className = "tree-folder";

        const header = document.createElement("div");
        header.className = "tree-folder-header"


        const arrow = document.createElement("span")
        arrow.className = "tree-folder-arrow";

        //Handles the specific arrow state
        arrow.textContent = folder.expanded || folder.id === currentActiveRoom ? "X" : "";

        const label = document.createElement("span")
        label.textContent = folder.mapName;

        header.appendChild(arrow);
        header.appendChild(label);


        //Deal with expanding the rows
        header.addEventListener("click", () => {
            //Update the bool
            folder.expanded = !folder.expanded;
            //Update the notifier
            arrow.textContent = folder.expanded || folder.id === currentActiveRoom ? "X" : "";

            updateActiveRoomGlobal(folder.id, true);
        });

        folderDiv.appendChild(header);
        cont.appendChild(folderDiv)

    });
}


async function updateActiveRoomGlobal(roomID, tellClients){
    ChangeRoomGlobal(roomID);
    if(tellClients){
        var success = await appState.connection.invoke("ChangeActiveRoom", roomID);

        if(success !== true){
            toastUser("Error", "There was an error telling clients to change rooms", "error")
        }
    }
}