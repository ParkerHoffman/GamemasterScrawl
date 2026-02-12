import {loadComponent} from "../router.js";
import { hashPassword, toastUser } from "../app.js";

//The reference to the library managing 3D stuff
import * as THREE from 'three';

var ddList = [];

//Setting up stuff for the ROTATING CUBE OF OMINOUS INTENT
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


export function init(container, appState){

    //This is teh button that a user presses to attempt to log in
    const loginBtn = container.querySelector("#LogInButton");
  
    //This is what happens on login attempt
    loginBtn.addEventListener("click", async () => {ValidateCreds(container, appState)});

    //This is preloading the user list
    getUserList(appState, container);


    //This handles a user logging in, and removes them from the dd List
    appState.connection.on("UserSuccessfullyLoggedIn", function (username)  {
        RemoveLoginOption(username, container)
    })

    //This handles a user logging in, and removes them from the dd List
    appState.connection.on("UserSuccessfullyDisconnects", function (username)  {
        AddLoginOption(username, container)
    })

    AddOminousCube(container);

}


async function getUserList(state, container){
    ddList = await state.connection.invoke("GetUserNameList");

    ddResetter(container)
}

//Resets the DD to reflect current state of ddList
function ddResetter(container){
    const ddCont = container.querySelector("#usernameInputHolder");
    var innerHtmlHoler = `<select name="Username" id="usernameInput">`

ddList.forEach((x) => {
    innerHtmlHoler += `<option value="${x}">${x}</option>`;
})

  innerHtmlHoler += `</select>`;

  ddCont.innerHTML = innerHtmlHoler;
}

//Removes the given user from the DD list
function RemoveLoginOption(user, container){
    ddList = ddList.filter((e) => e !== user);

    ddResetter(container);
}

//Adds a user on user disconnect to the DD Options
function AddLoginOption(user, container){
    ddList = [...ddList, user]

    ddResetter(container);
}


  //This is the function run on clicking the 'login' button. It handles logging in
async function ValidateCreds(container, appState){
    // Get the username and the password
    var user = container.querySelector("#usernameInput").value;
    var pass = container.querySelector("#passwordInput").value;

    //If there is no username, alert the user to this fact
    if(!user){
        toastUser("More Info Needed", 'Please choose a username', 'warn')
        return;
    }

    //If there is no password, alert the user to this fact. This error will be utilized from this point onwards
    if(!pass){
        toastUser("More Info Needed", `Please insert a valid password for the user '${user}'`, 'warn')
        return;
    }

    //Hashing the pass
    const newPass = hashPassword(pass);

    //Tell the server the login creds for it to do it's magic
    var success = await appState.connection.invoke("UserLogin", user, newPass);

    if(success === true){
        //Tell the user the good news
        toastUser("Success", `Successfully logged in as ${user}`, 'success')
        //Send the user home, into the app
        loadComponent("Home");
    } else {
        toastUser("Bad Credetials", `Please insert a valid password for the user '${user}`, 'error')
    }
}
function RandomIntGen() {
    return Math.floor(Math.random() * 21) - 10;
}



function AddOminousCube(container){
        const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

    var ominousCubeCont = container.querySelector("#OminousCube");

    ominousCubeCont.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;
    const randomYChng = RandomIntGen()
    const randomXChng = RandomIntGen()


function animate() {
    cube.rotation.x += 0.01 * randomXChng;
    cube.rotation.y += 0.01 * randomYChng;

    renderer.render(scene, camera);
}



renderer.setAnimationLoop( animate );



}







