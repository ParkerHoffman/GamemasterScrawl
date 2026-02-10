import {loadComponent} from "../router.js";
import { hashPassword } from "../app.js";

var userList = [];

export async function init(container, appState){


const returnHomeBtn = container.querySelector("#returnHome");
  
returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

const newUsrBtn = container.querySelector("#CreateNewUser");
  
newUsrBtn.addEventListener("click", async () => {createNewUser(container, appState)});

UpdateTable(container, appState);
}


async function createNewUser(container, appState){
     // Get the username and the password
        var userI = container.querySelector("#NewusernameInput")
        var passI = container.querySelector("#NewpasswordInput")

        var user = userI.value;
        var pass = passI.value;
    
        //If there is no username, alert the user to this fact
        if(!user){
            alert('Please enter a new username');
            return;
        }
    
        //If there is no password, alert the user to this fact. This error will be utilized from this point onwards
        if(!pass){
            alert(`Please insert a valid password for the user '${user}`);
            return;
        }
    
        //Hashing the pass
        const newPass = hashPassword(pass);
    
        //Tell the server the login creds for it to do it's magic
        var success = await appState.connection.invoke("CreateUser", user, newPass);

        if(success == true){
            UpdateTable(container, appState);

            passI.value = "";
            userI.value = "";
        } else {
            alert('There was an error creating this user. It could be due to another user already possessing this username')
        }
}


async function UpdateTable(container, appState){
userList = await appState.connection.invoke("GetFullUserList");

    const displayTableCont = container.querySelector("#UsermanagementTableContainer");


    var innerString = "<table><thead><tr><td>ID</td><td>Username</td><td>Edit Password</td></tr></thead><tr>";

    userList.forEach((e) => {
        innerString += `<tr><td>${e.id}</td><td>${e.username}</td><td><input id=\"passwordChange${e.id}\"/><button id=\"passwordChangeSubmit${e.id}\">Change Password</button></td></tr>`;
    })



    innerString += "</table>";


    displayTableCont.innerHTML = innerString;

    //Setting up the listener set for all the buttons
        userList.forEach((e) => {
            const passEditBtn = container.querySelector("#passwordChangeSubmit" + e.id);
  
            passEditBtn.addEventListener("click", async () => {changeUserPassword(container, appState, e.id)});

    })
}

async function changeUserPassword(container, appState, id){
    var unhashedPassCont = container.querySelector(`#passwordChange${id}`);

    var hashed = hashPassword(unhashedPassCont.value);

    var success = await appState.connection.invoke("ChangeUserPassword", id, hashed);

    if(success == true){
        unhashedPassCont.value = "";
        alert('Password Successfully updated')
    } else {
        alert('Error. Password Not updated correctly')
    }
}