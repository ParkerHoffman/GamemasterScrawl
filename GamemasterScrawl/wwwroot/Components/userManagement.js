import {loadComponent} from "../router.js";

var userList = [];

export async function init(container, appState){


const returnHomeBtn = container.querySelector("#returnHome");
  
returnHomeBtn.addEventListener("click", async () => {loadComponent("home")});

userList = await appState.connection.invoke("GetFullUserList");

    const displayTableCont = container.querySelector("#UsermanagementTableContainer");

    console.log(displayTableCont, container);


    var innerString = "<table><thead><tr><td>Username</td></tr></thead><tr>";

    userList.forEach((e) => {
        innerString += "<td>" + e.username +  "<td>";
    })


    innerString += "</tr></table>";


    displayTableCont.innerHTML = innerString;
}

