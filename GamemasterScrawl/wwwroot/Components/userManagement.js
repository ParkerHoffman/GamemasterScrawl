import {loadComponent} from "../router.js";
import { hashPassword, toastUser } from "../app.js";

//The reference to the library managing 3D stuff
import * as THREE from 'three';

var userList = [];

//Setting up stuff for the ROTATING CUBE OF OMINOUS INTENT
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


export async function init(container, appState){


const returnHomeBtn = container.querySelector("#returnHome");
  
returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

const newUsrBtn = container.querySelector("#CreateNewUser");
  
newUsrBtn.addEventListener("click", async () => {createNewUser(container, appState)});

FetchTableInfo(container, appState);

    //This handles a user logging in, and updates the list to reflect that
    appState.connection.on("UserSuccessfullyLoggedIn", function (username)  {
        FetchTableInfo(container, appState)
    })

    //This handles a user logging in, and removes them from the dd List
    appState.connection.on("UserSuccessfullyDisconnects", function (username)  {
        FetchTableInfo(container, appState)
    })

    AddOminousCube(container);
}


async function createNewUser(container, appState){
     // Get the username and the password
        var userI = container.querySelector("#NewusernameInput")
        var passI = container.querySelector("#NewpasswordInput")

        var user = userI.value;
        var pass = passI.value;
    
        //If there is no username, alert the user to this fact
        if(!user){
            toastUser("More Info Needed", `Please enter a new username`, 'warn')
            return;
        }
    
        //If there is no password, alert the user to this fact. This error will be utilized from this point onwards
        if(!pass){
            toastUser("More Info Needed", `Please insert a valid password for the user '${user}`, 'warn')
            return;
        }
    
        //Hashing the pass
        const newPass = hashPassword(pass);
    
        //Tell the server the login creds for it to do it's magic
        var success = await appState.connection.invoke("CreateUser", user, newPass);

        if(success == true){
            FetchTableInfo(container, appState);

            passI.value = "";
            userI.value = "";
        } else {
            toastUser("Error", `Unable to create this user at this time. It could be due to a server error, or the username is not unique`, 'error')
        }
}


async function FetchTableInfo(container, appState){
userList = await appState.connection.invoke("GetFullUserList");

    UpdateTable(container, appState);
}

function UpdateTable(container, appState){
    const displayTableCont = container.querySelector("#UsermanagementTableContainer");


    var innerString = "<table><thead><tr><td>ID</td><td>Username</td><td>Edit Password</td><td>User Status</td><td>Kick User</td><td>Delete User</td></tr></thead><tr>";

    userList.forEach((e) => {
        innerString += `<tr><td>${e.id}</td><td>${e.username}</td><td><input autocomplete=\"new-password\" type=\"password\" id=\"passwordChange${e.id}\"/><button class="warn" id=\"passwordChangeSubmit${e.id}\">Change Password</button></td><td>`
        
        if(e.currentConnection && e.currentConnection.length > 0){
            innerString += `<div class="status-tag success">Active</div></td><td><button class="info" id=\"kickUser${e.id}\">Kick</button></td><td><button class="error" id=\"deleteUser${e.id}\">Delete</button></td></tr>`
        } else {
            innerString += `<div class="status-tag error">Logged Out</div></td><td><button id=\"kickUser${e.id}\" class=\"InactiveButton info\">Kick</button></td><td><button class="error" id=\"deleteUser${e.id}\">Delete</button></td></tr>`
        }
        
    })
    innerString += "</table>";
    displayTableCont.innerHTML = innerString;

    //Setting up the listener set for all the buttons
        userList.forEach((e) => {
            //Getting the password change buttons
            const passEditBtn = container.querySelector("#passwordChangeSubmit" + e.id);
            //Setting up the listener
            passEditBtn.addEventListener("click", async () => {changeUserPassword(container, appState, e.id)});
            
            //Getting the user delete button
            const usrDelBtn = container.querySelector("#deleteUser" + e.id);
  
            //Setting up the delete function
            usrDelBtn.addEventListener("click", async () => {DeleteUser(container, appState, e.id)});

                        //Getting the user delete button
            const usrKickBtn = container.querySelector("#kickUser" + e.id);
  
            //Setting up the delete function
            usrKickBtn.addEventListener("click", async () => {kickUser(container, appState, e.id)});

    })
}


//This is the function that handles changing a user's password
async function changeUserPassword(container, appState, id){
    //This is the container that holds the unhashed password
    var unhashedPassCont = container.querySelector(`#passwordChange${id}`);

    //This hashes the password
    var hashed = hashPassword(unhashedPassCont.value);

    //Now we ask the server to change the password of the user
    var success = await appState.connection.invoke("ChangeUserPassword", id, hashed);

    if(success == true){
        unhashedPassCont.value = "";
    } 
}

async function DeleteUser(container, appState, id){

    var success = await appState.connection.invoke("DeleteUser", id);

    if(success == true){
        FetchTableInfo(container, appState);
        toastUser("Deleted", `User successfully deleted`, 'success')
    } else {
        toastUser("Error", `Unable to delete user`, 'error')
    }
}


async function kickUser(container, appState, id){
    var success = await appState.connection.invoke("forceDisconnectAUser", id);

        if(success == true){
        FetchTableInfo(container, appState);
        toastUser("User Kicked", `Successfully logged the user out`, 'success')
    } else {
        toastUser("Error", `Error kicking user`, 'error')
    }
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


function AddOminousCube(container){
        const renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0x000000, 0); // transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

    var ominousCubeCont = container.querySelector("#OminousCube");

    ominousCubeCont.appendChild(renderer.domElement);

    const geometry = new THREE.DodecahedronGeometry(1,0);
    const material = new THREE.MeshBasicMaterial({color: 0x3688F4});

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