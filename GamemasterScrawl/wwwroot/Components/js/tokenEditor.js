import {loadComponent} from "../../router.js";
import { toastUser, popupModal, closeModal } from "../../app.js";
import { UploadTokenImage } from "./FileService.js";
import { getImageFile } from "./FileGrabber.js";

//The reference to the library managing 3D stuff
import * as THREE from 'three';

var userList = [];
var tokenList = [];
var appState = null;
var container = null;
var tokens = [];
var selectedImage = "";
var selectedUsers = [];

//Setting up stuff for the ROTATING CUBE OF OMINOUS INTENT
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


export async function init(cont, app){
    appState = app;
    container = cont;


    const returnHomeBtn = container.querySelector("#returnHome");
  
    returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

    const newImageBtn = container.querySelector("#addNewTokenImage");
    newImageBtn.addEventListener("click", async () => {addImages()})

    const newTokenBtn = container.querySelector("#CreateNewToken");
    newTokenBtn.addEventListener("click", () => popupNewToken())


    FetchTableInfo();
    AddOminousCube();
    updateTokenImageList();
}


async function addImages(){
    try{
        const file = await getImageFile();

        if(file){

            var success = await UploadTokenImage(file);

            if(success && success === true){

                toastUser('Success', 'Successfuly uploaded the token image', 'success');
                updateTokenImageList();
            } else {
                throw new Error();
            }

        }
    } catch (error){
        toastUser("Error", "Error Uploading the Material. Please try again later", "error")
    }
}


function popupNewToken(){
    popupModal({title: "Create new Token", content: newTokenContent(), closeable: true, onClose: closeModal})
}


function newTokenContent() {
    const wrapper = document.createElement("div");

    //Folder picker


        //Folder picker
    const mpicker = document.createElement("div");
    mpicker.className = "material-picker";

    tokens.forEach(token => {
         const tile = document.createElement("div");
        tile.className = "material-tile";
        tile.dataset.id = token;

        tile.style = `background-image: url('/Components/FileMaterials/TokenImages/${token}')`;


        tile.addEventListener("click", () => {

            var oldSelected = mpicker.querySelector(".selected")
            tile.classList.add("selected");
            selectedImage = token;

            if(oldSelected){
                oldSelected.classList.remove("selected");
            } 
        });

        mpicker.appendChild(tile);
    })




    const button = document.createElement("button");
    button.id = "tokenCreationBtn";
    button.className = "info";
    button.textContent = "Create Token";

    button.addEventListener("click", () => createFreshToken())
    
    //adding 
    wrapper.appendChild(button);

    const imageHeaderDiv = document.createElement("div");
    //imageHeaderDiv.TEXT_NODE = "Choose Image"

    wrapper.appendChild(imageHeaderDiv)
    wrapper.appendChild(mpicker)

    return wrapper;


}

async function createFreshToken(){
    try{
var success = await appState.connection.invoke("CreateFreshToken", selectedImage || "", selectedUsers )

    if(success && success === true){
        closeModal();
        toastUser("Success", "Created the Token", "success");
        selectedImage = "";
        selectedUsers = [];
        //Refresh the token list
        FetchTableInfo();
    }else {
        throw new Error();
    }
    } catch {
        toastUser("Error", "Error creating the Token", "error");
        return false;
    }
    
}


async function updateTokenImageList(){
    tokens = await appState.connection.invoke("GetMasterTokenList");
}


async function FetchTableInfo(){
userList = await appState.connection.invoke("GetFullUserList");
tokenList = await appState.connection.invoke("GetFullTokenList");
UpdateTable();
    
}

function editToken(ID){

}

function UpdateTable(){
    const displayTableCont = container.querySelector("#UsermanagementTableContainer");


    var innerString = "<table><thead><tr><td>ID</td><td>Token Image</td><td>Users</td></tr></thead><tr>";

    tokenList.forEach((e) => {
        var imageLocal = "";

        if(e.imgRef && e.imgRef.length > 0){
            imageLocal = `/Components/FileMaterials/TokenImages/${e.imgRef}`
        } else {
            imageLocal = "/Components/FileMaterials/Assets/DefaultToken.png"
        }


       innerString += `<tr><td>${e.id}</td><td><div class="img-card-media" style="background-image: url('${imageLocal}')"></div></td><td><button id="EditButton${e.id}">Edit</button></td><td>`
    })

    innerString += "</table>";
    displayTableCont.innerHTML = innerString;

    //Setting up the listener set for all the buttons
        tokenList.forEach((e) => {
           const editButton = container.querySelector(`#EditButton${e.id}`)
           editButton.addEventListener("click", () => editToken(e.id))


    })
}



function RandomIntGen() {
    return Math.floor(Math.random() * 21) - 10;
}

function RandomIntGenPos() {
    var num = RandomIntGen();
    if(num >= 0){
        return num;
    }
    return num * -1;
}

var xgoPositive = RandomIntGen() >= 0;
var ygoPositive = RandomIntGen() >= 0;
var zgoPositive = RandomIntGen() >= 0;


function AddOminousCube(){
        const renderer = new THREE.WebGLRenderer();

            appState.sceneSet.add({renderer: renderer, scene: scene})
        renderer.setClearColor(0x000000, 0); // transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

    var ominousCubeCont = container.querySelector("#OminousCube");

    ominousCubeCont.appendChild(renderer.domElement);

    const geometry = new THREE.OctahedronGeometry();
    const material = new THREE.MeshBasicMaterial({color: 0xf4e736});

    const cube = new THREE.Mesh(geometry, material);

    const edges = new THREE.EdgesGeometry(geometry);

    const edgeMaterial = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 10});
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);

    cube.add(edgeLines);


    scene.add(cube);

    camera.position.z = 5;
    const randomYChng = RandomIntGen()
    const randomXChng = RandomIntGen()
    const randomZMove = RandomIntGenPos();
    const randomYMove = RandomIntGenPos();
    const randomXMove = RandomIntGenPos();


function animate() {
    var holdingXMove = 0;
    var holdingYMove = 0;
    var holdingZMove = 0;
    if(xgoPositive){
        holdingXMove = .001 * randomXMove;
    } else {
        holdingXMove = -.001 * randomXMove;
    }

    if(ygoPositive){
        holdingYMove = .001 * randomYMove
    } else {
        holdingYMove = -.001 * randomYMove
    }

    if(zgoPositive){
        holdingZMove = .001 * randomZMove
    } else {
        holdingZMove = -.001 * randomZMove
    }

     if(camera.position.x <= -3 ){
        xgoPositive = true;
    }
    if( camera.position.x >= 3){
        xgoPositive = false;
    }

    if(camera.position.y <= -2 ){
        ygoPositive = true;
    }
    if( camera.position.y >= 2){
        ygoPositive = false;
    }

    if(camera.position.z <= 2 ){
        zgoPositive = true;
    }
    if( camera.position.z >= 10){
        zgoPositive = false;
    }
    
    camera.position.x += holdingXMove ;
    camera.position.y += holdingYMove ;
    camera.position.z += holdingZMove ;
    cube.rotation.x += 0.005 * randomXChng;
    cube.rotation.y += 0.005 * randomYChng;



    renderer.render(scene, camera);
}

renderer.setAnimationLoop( animate );

}