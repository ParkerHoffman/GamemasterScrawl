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


    var innerString = "<table><thead><tr><td>Username</td></tr></thead><tr>";

    userList.forEach((e) => {
        innerString += "<td>" + e.username +  "<td>";
    })


    innerString += "</tr></table>";


    displayTableCont.innerHTML = innerString;
}