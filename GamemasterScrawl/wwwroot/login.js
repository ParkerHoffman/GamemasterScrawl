const connection = new signalR.HubConnectionBuilder().withUrl("/socketHub").build();



async function ValidateCreds(){
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

    const ips = await connection.invoke("UserLogin", user, pass);
    console.log(user, pass);
}


//On call, it axes this window. Should be called on host disconnect
 connection.on("CloseWindow", function () {
        handleDisconnect();
 });

 async function handleDisconnect(){
    await connection.stop();
 }



connection.start().catch(err => console.error(err.toString()));