const connection = new signalR.HubConnectionBuilder().withUrl("/socketHub").build();



function ValidateCreds(){
    var user = document.getElementById("usernameInput").value;
    var pass = document.getElementById("passwordInput").value;


    if(!user){
        alert('Please enter a username');
        return;
    }

    if(!pass){
        alert(`Please insert a valid password for the user '${user}`);
        return;
    }
    console.log(user, pass);
}



connection.start().catch(err => console.error(err.toString()));