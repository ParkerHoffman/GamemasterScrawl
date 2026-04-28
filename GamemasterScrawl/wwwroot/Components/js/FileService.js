//Calls to the server to upload a file to the 'Materials' folder
export async function UploadMaterial(material){
    try{
        //Creating the request body
        const formData = new FormData();
        //Adding the file to the request body
        formData.append("file", material);

        //Calling to the server
        const response = await fetch(`http://${window.location.hostname}:8787/api/File/UploadMaterial`,
            {
                method: "POST", 
                body: formData
            }
        );

        //getting server's response
        const data = await response.json();
        return data;
    } catch {
        //Tell function it went wrong
        return false;
    }
}

//Uploads an image to the Tokens folder
export async function UploadTokenImage(material){
    try{
        //Creating fthe request body
        const formData = new FormData();
        //Loading file into it
        formData.append("file", material);


        //Sending file to server
        const response = await fetch(`http://${window.location.hostname}:8787/api/File/UploadToken`,
            {
                method: "POST", 
                body: formData
            }
        );

        //Server response
        const data = await response.json();
        //Tell function success
        return data;
    } catch {
        //Inform of failure
        return false;
    }
}