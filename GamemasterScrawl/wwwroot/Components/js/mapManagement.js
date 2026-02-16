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

var map;
var fileExplorer = [];
var selectedRoom;


export async function init(container, appState){

const returnHomeBtn = container.querySelector("#returnHome");
  
returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

    Generate3DSpace(container);
    map = await appState.connection.invoke("GetMapList");
    selectedRoom = map.activeRoom;
    HandleFileExplorerSetup(container);
    
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

function HandleFileExplorerSetup(container){
fileExplorer = [...map.maplist.map(e => ({...e, children: []})), {id: -1, mapName: "All Rooms", children: []}];

map.roomList.forEach(room => {
    fileExplorer = fileExplorer.map(folder => {

        if(room.containerID.includes(folder.id) || folder.id === -1){
            folder = {...folder, children: [...folder.children, room]}
        }
        return folder;
    })
})

renderTree(container, fileExplorer, selectItem, "#MapTreeRoot")
}


function selectItem(item){
    console.log(item)
}


function renderTree(container, data, onSelect, comp){
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
        arrow.textContent = folder.expanded ? "▼" : "▶";

        const label = document.createElement("span")
        label.textContent = folder.mapName;

        header.appendChild(arrow);
        header.appendChild(label);


        //Now we deal with the children

        const childrenDiv = document.createElement("div");
        childrenDiv.className = "tree-children";
        childrenDiv.style.display = folder.expanded ? "block" : "none";

        folder.children?.forEach(child => {
            const childItem = document.createElement("div");
            childItem.className = "tree-item";
            childItem.textContent = child.nickname;


            childItem.addEventListener("click", e => {
                e.stopPropagation();
                selectItem(childItem);
                onSelect(child);
            });


            childrenDiv.appendChild(childItem);


        });


        //Deal with expanding the rows
        header.addEventListener("click", () => {
            //Update the bool
            folder.expanded = !folder.expanded;
            //Update the arrow
            arrow.textContent = folder.expanded ? "▼" : "▶";
            //Update child display
            childrenDiv.style.display = folder.expanded ? "block" : "none";
        });

        folderDiv.appendChild(header);
        folderDiv.appendChild(childrenDiv);
        cont.appendChild(folderDiv)

    });
}