import {loadComponent} from "../../router.js";
import { toastUser, popupModal, closeModal } from "../../app.js";
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

//The reference to the library managing 3D stuff
import * as THREE from 'three';
import { createSpecialBlock, generateRandomNumber, loader, make3DBlock, rootPathMat } from "./helper3D.js";
import { UploadMaterial } from "./FileService.js";
import { getImageFile } from "./FileGrabber.js";

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

var map;
var fileExplorer = [];
var selectedRoom;

var selectedFolderList = [];
var matList = [];
var selectedMaterial = null;
var deleteMode = false;
var clickMode = false;
var interactableMode = false;
let ghostCube = null;


//This is the constant for the map and room inputs:
    var mapNinput = null;
    var xcoordInp = null;
    var ycoordInp = null;
    var zcoordInp = null;
    var roomNinput = null;

    var container = null;
    var appState = null;

    const maxDimensionSize = 100
    


export async function init(cont, app){

    container = cont;
    appState = app;

    const returnHomeBtn = container.querySelector("#returnHome");
  
    returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

    Generate3DSpace();
    map = await appState.connection.invoke("GetMapList");
    selectedRoom = map.activeRoom;
    HandleFileExplorerSetup();

    if(!app.activeRoom){
        app.activeRoom = await app.connection.invoke("GetGlobalActiveRoom");
    }

    var newRoom;

    
    if(app.activeRoom && app.activeRoom !== -1){
        newRoom = fileExplorer[fileExplorer.length - 1].children.filter((e) => e.id === app.activeRoom)[0]
    } else {
        newRoom = fileExplorer[fileExplorer.length - 1].children[0];
    }

    selectItem(newRoom)


        const newRoomBtn = container.querySelector("#create-new-room");
  
    newRoomBtn.addEventListener("click", async () => {popupNewRoom()});

            const newMapBtn = container.querySelector("#create-new-map");
  
    newMapBtn.addEventListener("click", async () => {popupNewMap()});

    const uploadMatBtn = container.querySelector("#UploadMaterial");
    uploadMatBtn.addEventListener("click", async () => AttemptMatUpload());

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
    selectedMaterial = matList[0];
    updateMatList(matList);

    renderer.domElement.addEventListener("click", (e) => onSceneClick(e));
    renderer.domElement.addEventListener("mousemove", (e) => onSceneMouseMove(e));

    createGhostCube();
    
}

function onSceneMouseMove(event){
    if(!event || !selectedRoom) return; //If nothing happened, do nothing (duh)

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    //Ghost cube is now exempt from casting
    const hittable = scene.children.filter((e) => e !== ghostCube && e instanceof THREE.Mesh);
    const hitCast = raycaster.intersectObjects(hittable, true).filter(h => h.object instanceof THREE.Mesh);

    if(!hitCast.length){
        ghostCube.visible = false;
        return;
    }

    updateGhostCubePosition(hitCast[0])
}

function onSceneClick(event){
    //No room is active, wait
    if(!selectedRoom || !event){
        return;
    }

    const CurrentRoom = fileExplorer[(fileExplorer.length - 1)].children
        .filter((room) => room.id === selectedRoom)[0];
    
    if((!ghostCube || !ghostCube.position|| ghostCube.position.x < 0) && CurrentRoom.blockList.length > 0){
        return;
    }

    if(deleteMode === true){
        handleBlockDeletion(ghostCube.position, CurrentRoom, event);
        return;
    }  
    if(clickMode === true){
        return;
    }

    if(interactableMode === true){
        handleInteractablePlacement(ghostCube.position, CurrentRoom, event)
        return;
    }

    handleBlockPlacement(ghostCube.position, CurrentRoom, event)
        
    

}

function updateGhostCubePosition(hit){
    if(!hit) return;
    const CurrentRoom = fileExplorer[(fileExplorer.length - 1)].children
        .filter((room) => room.id === selectedRoom)[0];

        let snapped;

        //Check if the cube is rendered 
        if(deleteMode === true || clickMode === true){

            snapped = snapToGrid(hit.object.position);

            const exists = blockExists(snapped, CurrentRoom);

            ghostCube.visible = exists;

            if(!exists) return;
        } else {
            //Snap to an adjacent block
            const faceN = hit.face.normal.clone();
            faceN.transformDirection(hit.object.matrixWorld);

            const placementPosition = hit.point.clone().add(faceN.multiplyScalar(0.5))

            snapped = snapToGrid(placementPosition);

            if(!isWithinBounds(snapped, CurrentRoom) || blockExists(snapped, CurrentRoom)){
                ghostCube.visible = false;
                return;
            } 
            ghostCube.visible = true;
        }

        ghostCube.position.set(snapped.x, snapped.y, snapped.z);
}


function createGhostCube(){

    ghostCube = make3DBlock(selectedMaterial, {       
         transparent: true,
        opacity: 0.6,
        depthWrite: false,
    });

    ghostCube.userData.persistent = true; // survives clearScene(), and thus remains after room changes
    ghostCube.visible = false; //Starts invisible
    scene.add(ghostCube); //Add the cube
}

function handleInteractablePlacement(hit, CurrentRoom, event){

    if(CurrentRoom.blockList.length === 0 ){
    CurrentRoom.blockList = [...CurrentRoom.blockList, {
        x: 0,
        y: 0,
        z: 0,
        material: "0xb200ed",
        isInteractable: true,
        interactableInfo: {type: "TrueTP", roomDest: "N/A", visible: true, coordDest: "N/A"}

    }]
    } else {

    if(!isWithinBounds(hit, CurrentRoom)) return;
    if(blockExists(hit, CurrentRoom)) return;

    CurrentRoom.blockList = [...CurrentRoom.blockList, {
        x: hit.x,
        y: hit.y,
        z: hit.z,
        material: "#b200ed",
        isInteractable: true,
        interactableInfo: {type: "TrueTP", roomDest: "N/A", visible: true, coordDest: "N/A"}
    }]
    }

    //Now we tell the server to update the current Room

    appState.connection.invoke("EditRoom", CurrentRoom)

        fileExplorer = fileExplorer.map((folder) => {
        folder.children = folder.children.map((room) => {if(room.id === CurrentRoom.id){
            return CurrentRoom;
        }
        return room;
    });

        return folder
    })
    renderRoom(CurrentRoom);
    
requestAnimationFrame(() => onSceneMouseMove(event))
}

//Handles placing a block on the grid
function handleBlockPlacement(hit, CurrentRoom, event){

    if(CurrentRoom.blockList.length === 0 ){
    CurrentRoom.blockList = [...CurrentRoom.blockList, {
        x: 0,
        y: 0,
        z: 0,
        material: selectedMaterial ? selectedMaterial : "Default_Decorated_Tile.jpg",
        isInteractable: false,
        interactableInfo: null,
    }]
    } else {

    if(!isWithinBounds(hit, CurrentRoom)) return;
    if(blockExists(hit, CurrentRoom)) return;

    CurrentRoom.blockList = [...CurrentRoom.blockList, {
        x: hit.x,
        y: hit.y,
        z: hit.z,
        material: selectedMaterial ? selectedMaterial : "Default_Decorated_Tile.jpg"
    }]
    }

    //Now we tell the server to update the current Room

    appState.connection.invoke("EditRoom", CurrentRoom)

        fileExplorer = fileExplorer.map((folder) => {
        folder.children = folder.children.map((room) => {if(room.id === CurrentRoom.id){
            return CurrentRoom;
        }
        return room;
    });

        return folder
    })
    renderRoom(CurrentRoom);
    
requestAnimationFrame(() => onSceneMouseMove(event))
}

function handleBlockDeletion(hit, CurrentRoom, event) {

    if (!blockExists(hit, CurrentRoom) || CurrentRoom.blockList.length === 0) return;

    CurrentRoom.blockList = CurrentRoom.blockList.filter(
        b => !(b.x === hit.x && b.y === hit.y && b.z === hit.z)
    );

    appState.connection.invoke("EditRoom", CurrentRoom);

    fileExplorer = fileExplorer.map((folder) => {
        folder.children = folder.children.map((room) => {if(room.id === CurrentRoom.id){
            return CurrentRoom;
        }
        return room;
    });
        return folder
    })

    renderRoom(CurrentRoom);

requestAnimationFrame(() => onSceneMouseMove(event))
    
}

function snapToGrid(vec){
    return{ 
        x: Math.floor(vec.x + .5),
        y: Math.floor(vec.y + .5),
        z: Math.floor(vec.z + .5)

    }
}

function isWithinBounds(pos, room){
    return (
        pos.x >= 0 && pos.x < room.xDimension && pos.y >= 0 && pos.y < room.yDimension && pos.z >= 0 && pos.z < room.zDimension
    )
}

function blockExists(pos, room){
    return room.blockList.some(b => b.x === pos.x && b.y === pos.y && b.z === pos.z)
}

function newMapContent() {
    const wrapper = document.createElement("div");

    const mapbutton = document.createElement("button");
    mapbutton.id = "mapCreationBtn";
    mapbutton.className = "info";
    mapbutton.textContent = "Create Map";

    wrapper.appendChild(mapNinput);
    wrapper.appendChild(mapbutton);

    mapbutton.addEventListener("click", async () => {CreateNewMap()})

    return wrapper;
}

function updateMatList(mats){

    var wrapper = container.querySelector("#MatListSelector");
    wrapper.innerHTML = "";

        //Folder picker
    const mpicker = document.createElement("div");
    mpicker.className = "material-picker";

    mats.forEach(material => {
         const tile = document.createElement("div");
        tile.className = "material-tile";
        tile.dataset.id = material;

        tile.style = `background-image: url('/Components/FileMaterials/Materials/${material}')`;


        tile.addEventListener("click", () => {

            var texture =  loader.load(
                `${rootPathMat}/${material}`,
                //On success: We don't care
                undefined,
                //On Progress: We don't care
                undefined,
                //On error:
                (err) =>{
                    loader.load(`${rootPathMat}/Default_Mossy_Stone.jpg`, (defaultTex) => {
                texture.image = defaultTex.image;
                texture.needsUpdate = true;
            });
                }
            )

            ghostCube.material.color.set(0xaaaaaa);
            ghostCube.material.map = texture;
            ghostCube.material.needsUpdate = true; 
            deleteMode = false;
            clickMode = false;
            interactableMode = false
            selectedMaterial = material;

            var oldSelected = mpicker.querySelector(".selected")
            tile.classList.add("selected");

            if(oldSelected){
                oldSelected.classList.remove("selected");
            } 
        });

        mpicker.appendChild(tile);
    })

        //Adding the delete button:
     const por = document.createElement("div");
        por.className = "material-tile";
        por.dataset.id = "interactBlock";

        por.style = `background-image: url('/Components/FileMaterials/Assets/PortalIcon.png')`;


        por.addEventListener("click", () => {

            ghostCube.material.color.set(0xb200ed);
            ghostCube.material.needsUpdate = true; 

            deleteMode = false;
            clickMode = false;
            interactableMode = true;
            var oldSelected = mpicker.querySelector(".selected")
            por.classList.add("selected");

            oldSelected?.classList.remove("selected");

                
        });

        mpicker.appendChild(por);

    //Adding the delete button:
     const del = document.createElement("div");
        del.className = "material-tile";
        del.dataset.id = "deleteBlock";

        del.style = `background-image: url('/Components/FileMaterials/Assets/DeleteIcon.png')`;


        del.addEventListener("click", () => {

            ghostCube.material.color.set(0xf44336);
            ghostCube.material.needsUpdate = true; 

            deleteMode = true;
            clickMode = false;
            interactableMode = false;
            var oldSelected = mpicker.querySelector(".selected")
            del.classList.add("selected");

            oldSelected?.classList.remove("selected");

                
        });

        mpicker.appendChild(del);

        //Adding the delete button:
     const cli = document.createElement("div");
        cli.className = "material-tile";
        cli.dataset.id = "deleteBlock";

        cli.style = `background-image: url('/Components/FileMaterials/Assets/ClickIcon.png')`;


        cli.addEventListener("click", () => {

            ghostCube.material.color.set(0xffffff);
            ghostCube.material.needsUpdate = true; 

            deleteMode = false;
            clickMode = true;
            interactableMode = false;
            var oldSelected = mpicker.querySelector(".selected")
            cli.classList.add("selected");

            oldSelected?.classList.remove("selected");

                
        });

        mpicker.appendChild(cli);


    wrapper.appendChild(mpicker);
    
}

function newRoomContent() {
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

    button.addEventListener("click", async () => {CreateNewRoom()})

    return wrapper;


}

function popupNewMap(){
popupModal({title: "Create New Map", content: newMapContent(), closeable: true, onClose: closeModal})

}

function popupNewRoom(){
    popupModal({title: "Create new Room", content: newRoomContent(), closeable: true, onClose: closeModal})
}

async function CreateNewMap(){
    //Get the value
    const inpVal = mapNinput.value;

    if(inpVal && inpVal.length > 0){
        try{
            const success = await appState.connection.invoke("CreateNewMap", inpVal);

            if(!success){
                throw new Error();
            }

            fileExplorer = [success, ...fileExplorer];

            renderTree(fileExplorer, selectItem, "#MapTreeRoot")

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


async function CreateNewRoom(){
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

    if(xCoordVal <= 0 || xCoordVal > maxDimensionSize || yCoordVal <= 0 || yCoordVal > maxDimensionSize || zCoordVal <= 0 || zCoordVal > maxDimensionSize){
        toastUser("Validate Dimensions", `Invalid Room Dimesions. Each size must be at least 1, and less than ${maxDimensionSize}`, "warn");
        return;
    }

    //TH temp list to send the array of corrsponding folders back to the server
    var foldList = [];

    if(selectedFolderList.size > 0){
        foldList = [...selectedFolderList];
    } 


    
    //Get the sevrer to create the new room
    var newRoom = await appState.connection.invoke("CreateNew3DRoom", roomNick, xCoordVal, yCoordVal, zCoordVal, foldList);

    //Update the fileExplorer
    fileExplorer = fileExplorer.map(folder => {
        if(newRoom.containerID.includes(folder.id) || folder.id === -1){
            folder.children = [...folder.children, newRoom]
        }

        return folder;
    })


    renderTree( fileExplorer, selectItem, "#MapTreeRoot")
    selectItem(newRoom)

    
    xcoordInp.value = null;
    ycoordInp.value = null;
    zcoordInp.value = null;
    roomNinput.value = null;
    selectedFolderList = [];
    closeModal();
}

async function Generate3DSpace(){

    appState.sceneSet.add({renderer: renderer, scene: scene})

        renderer.setClearColor(0x000000, 0); // transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

    var spaceCont = container.querySelector("#Space3D");

    spaceCont.appendChild(renderer.domElement);


        camera.position.z = 15;

        let lastTime = performance.now();

        function animate() {

            //Require damping is true, and thus I must update the controls
            controls.update(); 

            const now = performance.now();
            const delta = (now - lastTime) / 1000;
            lastTime = now;

             const knots = scene.children.filter(obj => obj.geometry?.type === "TorusKnotGeometry");

             knots.forEach(knot => {
    // Smooth rotation using knot's own speed
    knot.rotation.x += delta * knot.userData.rotation.x;
    knot.rotation.y += delta * knot.userData.rotation.y;

    // Stutter using knot's own timer and interval
    knot.userData.stutterTimer += delta;
    if (knot.userData.stutterTimer >= knot.userData.stutterInterval) {
        knot.userData.stutterTimer = 0;
        const p = generateRandomNumber(1,21);
        const q = generateRandomNumber(1,21);
        const { radius, tube, tubularSegments, radialSegments } = knot.geometry.parameters;
        knot.geometry.dispose();
        knot.geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
    }
});



    renderer.render(scene, camera);
}

renderer.setAnimationLoop( animate );
}

function HandleFileExplorerSetup(){

fileExplorer = [...map.maplist.map(e => ({...e, children: []})), {id: -1, mapName: "All Rooms", children: []}];

map.roomList.forEach(room => {
    fileExplorer = fileExplorer.map(folder => {

        if(room.containerID.includes(folder.id) || folder.id === -1){
            folder = {...folder, children: [...folder.children, room]}
        }
        return folder;
    })
})

renderTree( fileExplorer, selectItem, "#MapTreeRoot")
}


function selectItem(item){
    if(!item){ return;}
    selectedRoom = item.id;
    renderRoom(item);
}

function renderRoom(room){
    clearScene();

    const maxDims = getRoomBounds(room);

    renderRoomBounds(maxDims);
    
    room.blockList.forEach(block => {
        if(block.isInteractable && block.isInteractable === true){
            

            const magicTorus = createSpecialBlock(block);
                magicTorus.position.x = block.x;
                magicTorus.position.y = block.y;
                magicTorus.position.z = block.z;

            const magicTorusCube = make3DBlock(null);

                magicTorusCube.position.x = block.x;
                magicTorusCube.position.y = block.y;
                magicTorusCube.position.z = block.z;

                scene.add(magicTorusCube)
                scene.add(magicTorus)

        } else {
        const cube = make3DBlock(block.material);
        cube.position.x = block.x;
        cube.position.y = block.y;
        cube.position.z = block.z;

        scene.add(cube);
        }


    })
        
}

function getRoomBounds(room){
    return {
        x: room.xDimension,
        y: room.yDimension,
        z: room.zDimension,

        maxX: room.xDimension - 1,
        maxY: room.yDimension - 1,
        maxZ: room.zDimension - 1

    }
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

async function deleteFolder(id) {
    try{

        var success = await appState.connection.invoke("DeleteFolder", id);

        if(!success){
            throw new Error();
        }

        fileExplorer = fileExplorer.map(folder => {
            if(folder.id !== id){
                folder.children = folder.children.map((room) => {
                    //Wipe the references to this folder
                    room.containerID = room.containerID.filter((x) => x !== id);
                    return room;
                })

                return folder;
            }
        }).filter(e => e)

        renderTree( fileExplorer, selectItem, "#MapTreeRoot");

    } catch {
        toastUser("error", "Error", "There was an error deleting this map. Please try again later")
    }
    
}

async function deleteRoom(room){
    try{
        
        var success = await appState.connection.invoke("DeleteRoom", room.id);

        if(!success){
            throw new Error();
        }

        fileExplorer = fileExplorer.map(folder => {
            folder.children = folder.children.filter((e) => e.id !== room.id)
        return folder;
            
        })

        renderTree( fileExplorer, selectItem, "#MapTreeRoot");

        if(selectedRoom === room.id){
            selectedRoom = null;
            clearScene();
        }

    } catch{toastUser("error", "Error", "There was an error deleting the room. Please try again later")}
    
}


async function AttemptMatUpload(){
    try{
        console.log("Hitting")
        const file = await getImageFile();
        console.log(file);
        if(file){

            var success = await UploadMaterial(file);

            console.log(success);

        }
    } catch (error){
        console.error(error);
        toastUser("Error", "Error Uploading the Material. Please try again later", "error")
    }
}


//This function creates (and updates) the file Tree
function renderTree( data, onSelect, comp){
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
        
        if(folder.id !== -1){
            const deleteFolderButton = document.createElement("button");
            deleteFolderButton.className = "error";
            deleteFolderButton.addEventListener("click", e => {
                e.stopPropagation();
                deleteFolder(folder.id);
            })

            deleteFolderButton.innerHTML = "Delete Folder"

            header.appendChild(deleteFolderButton);
        }

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
                onSelect(child);
            });


            const deleteRoomButton = document.createElement("button");
            deleteRoomButton.innerHTML = "Delete Room"
            deleteRoomButton.className = "error"
            deleteRoomButton.addEventListener("click", e => {
                e.stopPropagation();
                deleteRoom(child)
            })

            childItem.appendChild(deleteRoomButton)
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