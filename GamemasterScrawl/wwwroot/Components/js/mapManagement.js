import {loadComponent} from "../../router.js";
import { toastUser, popupModal, closeModal } from "../../app.js";
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

var selectedFolderList = [];
var matList = [];


//This is the constant for the map and room inputs:
    var mapNinput = null;
    var xcoordInp = null;
    var ycoordInp = null;
    var zcoordInp = null;
    var roomNinput = null;


    


export async function init(container, appState){

    const returnHomeBtn = container.querySelector("#returnHome");
  
    returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

    Generate3DSpace(container, appState);
    map = await appState.connection.invoke("GetMapList");
    selectedRoom = map.activeRoom;
    HandleFileExplorerSetup(container);


        const newRoomBtn = container.querySelector("#create-new-room");
  
    newRoomBtn.addEventListener("click", async () => {popupNewRoom(container, appState)});

            const newMapBtn = container.querySelector("#create-new-map");
  
    newMapBtn.addEventListener("click", async () => {popupNewMap(container, appState)});

    //Setting up the editing modal components
    mapNinput = document.createElement("input");
    mapNinput.type = "text";
    mapNinput.id = "NewMapNameInput";
    mapNinput.placeholder = "New Map Name";

        //Setting up the editing modal components
    roomNinput = document.createElement("input");
    roomNinput.type = "text";
    roomNinput.id = "NewRoomNameInput";
    roomNinput.placeholder = "New Room NickName";

    xcoordInp = document.createElement("input");
    xcoordInp.type = "number";
    xcoordInp.id = "xDimensionSize";
    xcoordInp.placeholder = "X Size";

    ycoordInp = document.createElement("input");
    ycoordInp.type = "number";
    ycoordInp.id = "yDimensionSize";
    ycoordInp.placeholder = "Y Size";

    zcoordInp = document.createElement("input");
    zcoordInp.type = "number";
    zcoordInp.id = "zDimensionSize";
    zcoordInp.placeholder = "Z Size";

    matList = await appState.connection.invoke("GetMasterMaterialList");
    console.log(matList)
    
}





function newMapContent(container, appState) {
    const wrapper = document.createElement("div");



    const mapbutton = document.createElement("button");
    mapbutton.id = "mapCreationBtn";
    mapbutton.className = "info";
    mapbutton.textContent = "Create Map";

    wrapper.appendChild(mapNinput);
    wrapper.appendChild(mapbutton);

    mapbutton.addEventListener("click", async () => {CreateNewMap(container, appState)})

    return wrapper;
}

function newRoomContent(container, appState) {
    const wrapper = document.createElement("div");


    //Folder picker
    const fpicker = document.createElement("div");
    fpicker.className = "material-picker";

    selectedFolderList = new Set();

    if(fileExplorer.length === 1){
        const notifyDiv = document.createElement("div");
        notifyDiv.innerHTML = "<span>No folders to put the room in exist...</span>"
        fpicker.appendChild(notifyDiv)
    }

    fileExplorer.forEach((folder) => {
        if(folder.id !== -1){
        const tile = document.createElement("div");
        tile.className = "material-tile";
        tile.dataset.id = folder.id;


                const label = document.createElement("span");
        label.className = "material-label";
        label.textContent = folder.mapName;

        tile.appendChild(label);

        tile.addEventListener("click", () => {
            if (selectedFolderList.has(folder.id)) {
                selectedFolderList.delete(folder.id);
                tile.classList.remove("selected");
            } else {
                selectedFolderList.add(folder.id);
                tile.classList.add("selected");
            }
        });

        fpicker.appendChild(tile);
        }
       
    })





    const button = document.createElement("button");
    button.id = "roomCreationBtn";
    button.className = "info";
    button.textContent = "Create Room";


    //On room creation/edit: We need dimensions, nickname, and material list. For he latter: We need some kind of multiselect
    //wrapper.appendChild(mapNinput);
    wrapper.appendChild(roomNinput);
    wrapper.appendChild(xcoordInp);
    wrapper.appendChild(ycoordInp);
    wrapper.appendChild(zcoordInp);
    
    const headerDiv = document.createElement("div");
    headerDiv.innerHTML = "<h1>Choose Folder(s) for the room to appear in</h1>"
    wrapper.appendChild(headerDiv)
    //adding 
    wrapper.appendChild(fpicker);
    wrapper.appendChild(button);

    button.addEventListener("click", async () => {CreateNewRoom(container, appState)})

    return wrapper;


}

function popupNewMap(container, appState){
popupModal({title: "Create New Map", content: newMapContent(container, appState), closeable: true, onClose: closeModal})

}

function popupNewRoom(container, appState){
    popupModal({title: "Create new Room", content: newRoomContent(container, appState), closeable: true, onClose: closeModal})
}

async function CreateNewMap(container, appState){
    //Get the value
    const inpVal = mapNinput.value;

    if(inpVal && inpVal.length > 0){
        try{
            const success = await appState.connection.invoke("CreateNewMap", inpVal);

            if(!success){
                throw new Error();
            }

            fileExplorer = [success, ...fileExplorer];

            renderTree(container, fileExplorer, selectItem, "#MapTreeRoot")

            //Tell user success
            toastUser("More Info", `Created map '${inpVal}'`, "success")

            //Close the modal after success
            closeModal()
        } catch{
            toastUser("Error", 'There was an error creating the map', 'error')
        }


    } else {
        toastUser("More Info", "Please give the map a name", "info")
    }


}


async function CreateNewRoom(container, appState){
    const roomNick = roomNinput.value;

    if(!roomNick || roomNick.length < 1){
        toastUser("More Info Needed", "Please enter a name for the room", "info");
        return;
    }

    const xCoordVal = xcoordInp.value;
    const yCoordVal = ycoordInp.value;
    const zCoordVal = zcoordInp.value;

    if(!xCoordVal || !yCoordVal || !zCoordVal){
        toastUser("More Info Needed", "Please enter room dismensions", "info");
        return;
    }

    if(xCoordVal <= 0 || xCoordVal > 50 || yCoordVal <= 0 || yCoordVal > 50 || zCoordVal <= 0 || zCoordVal > 50){
        toastUser("Validate Dimensions", "Invalid Room Dimesions. Each size must be at least 1, and less than 50", "warn");
        return;
    }

    //TH temp list to send the array of corrsponding folders back to the server
    var foldList = [];

    if(selectedFolderList.size > 0){
        foldList = [...selectedFolderList];
    } 


    
    //Get the sevrer to create the new room
    var newRoom = await appState.connection.invoke("CreateNew3DRoom", roomNick, xCoordVal, yCoordVal, zCoordVal, foldList, matList);

    //Update the fileExplorer
    fileExplorer = fileExplorer.map(folder => {
        if(newRoom.containerID.includes(folder.id) || folder.id === -1){
            folder.children = [...folder.children, newRoom]
        }

        return folder;
    })

    renderTree(container, fileExplorer, selectItem, "#MapTreeRoot")
    selectItem(newRoom, container)

    console.log(newRoom);


    
    xcoordInp.value = null;
    ycoordInp.value = null;
    zcoordInp.value = null;
    roomNinput.value = null;
    selectedFolderList = [];
    closeModal();


}



async function Generate3DSpace(container, appState){

    appState.sceneSet.add({renderer: renderer, scene: scene})

        renderer.setClearColor(0x000000, 0); // transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

    var spaceCont = container.querySelector("#Space3D");

    spaceCont.appendChild(renderer.domElement);



for (let i = 0; i < 10; i++) {
    for (let k = 0; k < 10; k++) {

       const cube = make3DBlock("Default_Decorated_Tile.jpg");

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


function selectItem(item, container){
    selectedRoom = item.id;
    renderRoom(item, container);
}

function renderRoom(room, container){
    clearScene();

    const maxDims = getRoomBounds(room);

    renderRoomBounds(maxDims);
    renderBlocks(room.blockList)
}

function getRoomBounds(room){
    return {
        x: room.xDimension,
        y: room.yDimension,
        z: room.yDimension,

        maxX: room.xDimension - 1,
        maxY: room.yDimension - 1,
        maxZ: room.zDimension - 1

    }
}

function renderBlocks(blockList){
    blockList.forEach(block => {
        const cube = make3DBlock(block.material);
        cube.position.x = block.x;
        cube.position.y = block.y;
        cube.position.z = block.z;

        scene.add(cube);

    })
}

function renderRoomBounds(bounds){
    const geometry = new THREE.BoxGeometry(
        bounds.x, bounds.y, bounds.z
    )

    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({color: 0x3688f4})

    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.set(
        bounds.x / 2 - .5,
        bounds.y / 2 - .5,
        bounds.z / 2 - .5
    );

    scene.add(wireframe);
}

function clearScene(){
    for(let i = scene.children.length - 1; i >= 0; i--){
            const obj = scene.children[i];
            if(obj.userData?.persistent) continue;
            scene.remove(obj);
    }
}


//This function creates (and updates) the file Tree
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
                selectItem(childItem, container);
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