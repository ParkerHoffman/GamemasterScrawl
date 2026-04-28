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

//This is the magic cube
let ghostCube = null;

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
var tokenAddList = [];

var appState = null;
var container = null;
var currentActiveRoom = null;
var selectedRoom = null;

var selectedToken = null;
var activeToken = null;
var choosingToken = false;

var isDragging = false;
var dragStartPos = null;

export async function init(cont, app){
        appState = app;
        container = cont;

        await Generate3DSpace(container, "#Space3D", appState, renderer, camera, scene, controls);

        var map = await appState.connection.invoke("GetMapList");
        currentActiveRoom = await appState.connection.invoke("GetGlobalActiveRoom");

        mapList = map.roomList;
        tokenAddList = map.tokenList;

        ChangeRoomGlobal(currentActiveRoom)
//If user is the host
if(appState.isHost == true){
    //The holder for the UM Navigator Button
    const manageBtn = container.querySelector("#HeaderButtonHolder");

    manageBtn.innerHTML = "<button id=\"openUserManagement\" class=\"info\">User Management</button>";
    //The button itself
    const usrMangBtn = container.querySelector("#openUserManagement");
  
    usrMangBtn.addEventListener("click", async () => {loadComponent("userManagement")});

        //The button itself
    const mapMangBtn = container.querySelector("#openMapManagement");
  
    mapMangBtn.addEventListener("click", async () => {loadComponent("mapManagement")});

    const tokenMangBtn = container.querySelector("#openTokenManagement");
  
    tokenMangBtn.addEventListener("click", async () => {loadComponent("tokenEditor")});


    renderFolderTree(mapList, "#SpecialInteractables");
    renderTokenAdditions(tokenAddList, "#TokenAdditionSelector")
    
} else {
    const logOutBtn = container.querySelector("#HeaderButtonHolder");

        logOutBtn.innerHTML = "<button id=\"UserRequestsLogOut\" class=\"info\">Log Out</button>";
    //The button itself
    const usrlogOutBtn = container.querySelector("#UserRequestsLogOut");
  
    usrlogOutBtn.addEventListener("click", async () => {logUsrOut(appState)});


    appState.connection.on("SelectFreshGlobalRoom", (id) => ChangeRoomGlobal(id))
}

setUpSidebarTabs();

    renderer.domElement.addEventListener("mousedown", (e) => onSceneMouseDown(e));
    renderer.domElement.addEventListener("mouseup", (e) => onSceneMouseUp(e));
    renderer.domElement.addEventListener("mousemove", (e) => onSceneMouseMove(e));

createGhostCube();

    appState.connection.on("RefreshRoom", (newID) => refreshMap(newID));




appState.connection.on("TokenMoved", (roomId, tokenId, x, y, z) => {
    // Update local data
    const room = mapList.find(r => r.id === roomId);
    if (room) {
        const token = room.tokens.find(t => t.id === tokenId);
        if (token) {
            token.x = x;
            token.y = y;
            token.z = z;
        }
    }

    // If this is the active room, re-render
    if (roomId === currentActiveRoom) {
        const currentRoom = mapList.find(r => r.id === roomId);
        renderRoom(scene, currentRoom, true);
        // Reapply selection ring if this was the active token
        if (tokenId === activeToken) {
            setTokenSelected(tokenId, true);
        }
    }
});


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

function ChangeRoomGlobal(id, map){
    currentActiveRoom = id;
    var currentRoom;
    if(map){
        currentRoom = map.filter((e) => e.id === id);
    } else {
        currentRoom = mapList.filter((e) => e.id === id);
    }
    
    if(currentRoom && currentRoom[0]){
        renderRoom(scene, currentRoom[0], true)

        let validTokens = [];
        if(appState.isHost === true){
            validTokens = currentRoom[0].tokens;
        } else {
            validTokens = currentRoom[0].tokens.filter((e) => e.additionalEditors.includes(appState.user) || e.TokenRef.usersToManipulate.includes(appState.user))
        }

        renderTokenSelector(validTokens, "#TokenChooserPane");
        selectedRoom = currentRoom[0]
    } 
    
}

async function refreshMap(id){
     const updated = await appState.connection.invoke("ReloadRoom", room.id)
    const newMap = mapList.forEach((room) => {
        if(id === room.id){
           return updated;
        } else {
            return room;
        }
    })

    mapList = newMap;

    if(currentActiveRoom === id){
        ChangeRoomGlobal(id)
    }
}


//This function creates (and updates) the file Tree
function renderFolderTree( data, comp){
    const cont = container.querySelector(comp);

    cont.innerHTML = "";

    data.forEach(folder => {
        const folderDiv = document.createElement("div");
        folderDiv.className = "tree-folder";

        const header = document.createElement("div");
        header.className = "tree-folder-header"
        header.textContent = folder.nickname;


        //Handles the specific arrow state
        if(folder.expanded || folder.id === currentActiveRoom){
            folderDiv.classList.add("selected")
        }
        folderDiv.classList.add("ActiveMapOption");

        const label = document.createElement("span")
        label.textContent = folder.mapName;

        header.appendChild(label);


header.addEventListener("click", () => {
container.querySelectorAll(".ActiveMapOption").forEach(a => a.classList.remove("selected"));

    folderDiv.classList.add("selected")
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


function setUpSidebarTabs(){
    const tabs = container.querySelectorAll(".tab-btn");
 
    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            container.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            container.querySelector(`#tab-${btn.dataset.tab}`).classList.add("active");

             selectedToken = null;
            activeToken = null;
            choosingToken = false;

        });
    });
}

function renderTokenAdditions(data, comp){
    const cont = container.querySelector(comp);

    cont.innerHTML = "";

    data.forEach(folder => {
        const folderDiv = document.createElement("div");
        folderDiv.className = "tree-folder";

        const header = document.createElement("div");
        header.className = "tree-folder-header"
        //header.textContent = folder.nickname;

        var imageLocal = "";

        if(folder.imgRef && folder.imgRef.length > 0){
            imageLocal = `/Components/FileMaterials/TokenImages/${folder.imgRef}`
        } else {
            imageLocal = "/Components/FileMaterials/Assets/DefaultToken.png"
        }

        const label = document.createElement("div")
        label.classList.add("img-card-media")
        label.style = `background-image: url('${imageLocal}')`;

        header.appendChild(label);


folderDiv.addEventListener("click", () => {
    if(folderDiv.classList.contains("ActiveTokenOption")){
        selectedToken = null;
        folderDiv.classList.remove("ActiveTokenOption")

    } else {
        container.querySelectorAll(".ActiveTokenOption").forEach(a => a.classList.remove("ActiveTokenOption"));
selectedToken = folder.id;
folderDiv.classList.add("ActiveTokenOption")
    }


});

        folderDiv.appendChild(header);
        cont.appendChild(folderDiv)

    });
}

function renderTokenSelector(data, comp){
    const cont = container.querySelector(comp);

    cont.innerHTML = "";

    data.forEach(folder => {
        const folderDiv = document.createElement("div");
        folderDiv.className = "tree-folder";

        const header = document.createElement("div");
        header.className = "tree-folder-header"
        //header.textContent = folder.nickname;

        var imageLocal = "";
        if(folder.tokenRef && folder.tokenRef.imgRef){
            imageLocal = `/Components/FileMaterials/TokenImages/${folder.tokenRef.imgRef}`
        } else {
            imageLocal = "/Components/FileMaterials/Assets/DefaultToken.png"
        }

        const label = document.createElement("div")
        label.classList.add("img-card-media")
        label.style = `background-image: url('${imageLocal}')`;

        header.appendChild(label);


folderDiv.addEventListener("click", () => {
    if(folderDiv.classList.contains("ActiveTokenOption")){
        selectedToken = null;
        folderDiv.classList.remove("ActiveTokenOption")
        setTokenSelected(folder.id, false)

    } else {
        container.querySelectorAll(".ActiveTokenOption").forEach(a => a.classList.remove("ActiveTokenOption"));
activeToken = folder.id;
folderDiv.classList.add("ActiveTokenOption")
setTokenSelected(folder.id, true)
    }


});

        folderDiv.appendChild(header);
        cont.appendChild(folderDiv)

    });
}

function setTokenSelected(tokenId, isSelected) {
    const tokenMesh = scene.children.find(e => e.userData.id === tokenId && e.geometry?.type === "CircleGeometry");
    if (!tokenMesh) return;

    const circleGeoChildren = scene.children.filter((e) => e.geometry?.type === "CircleGeometry")

        // Remove all existing rings
    circleGeoChildren.forEach((circle) => {
        const existing = circle.children.find(c => c.geometry?.type === "RingGeometry")
    if (existing) {
        existing.geometry.dispose();
        circle.remove(existing);
    }
    })
    
    if (isSelected) {
        const ringGeo = new THREE.RingGeometry(0.52, 0.62, 32); // just outside the circle
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x4CAF50, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.userData.isSelectionRing = true;
        ring.position.z = -0.01; // slightly behind the token face
        tokenMesh.add(ring);
    }
}

function onSceneMouseMove(event) {
    if (!event || !selectedRoom) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hittable = scene.children.filter((e) => e !== ghostCube && e instanceof THREE.Mesh);
    const hitCast = raycaster.intersectObjects(hittable, true).filter(h => h.object instanceof THREE.Mesh);

    if (!hitCast.length) {
        if (!isDragging) ghostCube.visible = false;
        return;
    }

    // During a drag, use placement-style snapping regardless of mode
    if (isDragging) {
        const faceN = hitCast[0].face.normal.clone();
        faceN.transformDirection(hitCast[0].object.matrixWorld);
        const placementPosition = hitCast[0].point.clone().add(faceN.multiplyScalar(0.5));
        const snapped = snapToGrid(placementPosition);
        if (isWithinBounds(snapped, selectedRoom)) {
            ghostCube.position.set(snapped.x, snapped.y, snapped.z);
            ghostCube.visible = true;
        }
        return;
    }

    updateGhostCubePosition(hitCast[0]);
}

function onSceneMouseDown(event) {
    if (!selectedRoom || !event) return;

    if (activeToken !== null) {
        isDragging = true;
        dragStartPos = { ...ghostCube.position };
        ghostCube.visible = true;
        return;
    }

    // Original click logic for placing tokens or selecting them
    if (selectedToken !== null) {
        addFreshToken();
        return;
    }

    // Try to select a token at the ghost cube position
    const currentRoom = mapList.filter((e) => e.id === currentActiveRoom);
    const token = currentRoom[0]?.tokens?.find(
        (t) => t.x === ghostCube.position.x && t.y === ghostCube.position.y && t.z === ghostCube.position.z
    );
    if (token) {
        // Deselect previous
        if (activeToken !== null) setTokenSelected(activeToken, false);
        activeToken = token.id;
        setTokenSelected(token.id, true);
    }
}

async function onSceneMouseUp(event) {
    if (!isDragging || activeToken === null) {
        isDragging = false;
        return;
    }

    isDragging = false;

    const newPos = {
        x: ghostCube.position.x,
        y: ghostCube.position.y,
        z: ghostCube.position.z
    };

    if (dragStartPos && newPos.x === dragStartPos.x && newPos.y === dragStartPos.y && newPos.z === dragStartPos.z) {
        return;
    }

    var success = await appState.connection.invoke("MoveTokenInstance", currentActiveRoom, activeToken, newPos.x, newPos.y, newPos.z);

    if (!success) {
        toastUser("Error", "Error moving token", "error");
    }
}


function updateGhostCubePosition(hit){
    if(!hit) return;
    const CurrentRoom = selectedRoom;

        let snapped;

        //Check if the cube is rendered 
        if(!choosingToken && !selectedToken){

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

async function addFreshToken(){
    var success = await appState.connection.invoke("CreateNewTokenInstance", currentActiveRoom, selectedToken, ghostCube.position.x, ghostCube.position.y, ghostCube.position.z )

    if(!success){
        toastUser("Error", "Error creating new token instance", "Error")
    }

}


function createGhostCube(){
    const geometry = new THREE.BoxGeometry(1,1,1);
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    var material = new THREE.MeshBasicMaterial({color: "#aaaaaa", transparent: true, opacity: .6, depthWrite: false,});

    ghostCube = new THREE.Mesh(geometry, material); 
    
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    ghostCube.add(edgeLines);
    

    ghostCube.userData.persistent = true; // survives clearScene(), and thus remains after room changes
    ghostCube.visible = false; //Starts invisible
    scene.add(ghostCube); //Add the cube
}

//This function enforces that the given position is still within bounds and not outside of the room's dimensions
function isWithinBounds(pos, room){
    return (
        pos.x >= 0 && pos.x < room.xDimension && pos.y >= 0 && pos.y < room.yDimension && pos.z >= 0 && pos.z < room.zDimension
    )
}

//This verifies if a block (or token) already exists at the given position
function blockExists(pos, room){
    var validTokens = room.tokens.filter(b => b.x === pos.x && b.y === pos.y && b.z === pos.z);
    
    return (validTokens[0] ) || room.blockList.some(b => b.x === pos.x && b.y === pos.y && b.z === pos.z)
}

//This function forces the cords to be whole numbers
function snapToGrid(vec){
    return{ 
        x: Math.floor(vec.x + .5),
        y: Math.floor(vec.y + .5),
        z: Math.floor(vec.z + .5)

    }
}
