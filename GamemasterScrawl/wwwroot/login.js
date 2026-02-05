const connection = new signalR.HubConnectionBuilder().withUrl("/socketHub").build();

var isHost = false;



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

    await connection.invoke("UserLogin", user, pass);
    console.log(user, pass);
}

async function checkHostStatus(){
    isHost = await connection.invoke("CheckIfHost");

    if(isHost = true){
        //Now redirect to the home page
        console.log("I'm the host")
    }
}



//On call, it axes this window. Should be called on host disconnect
 connection.on("CloseWindow", function () {
        handleDisconnect();
 });

 async function handleDisconnect(){
    await connection.stop();
 }


 async function startConnection(){
    try{
        console.log("Starting conn");
        await connection.start();

        console.log("Conn done. Now, host")

        await checkHostStatus();

        console.log("setup done")
    } catch(err){
        //Try again in a few seconds
setTimeout(startConnection, 5000);
    }


 }


//Start the socket connection (And other startup functions)
startConnection();



