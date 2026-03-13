
        /*
            Get Call:
            const response = await fetch("http://${window.location.hostname}:8787/api/File/UploadMaterial")
        */

export async function UploadMaterial(material){
    try{

        const formData = new FormData();
    formData.append("file", material);


        const response = await fetch(`http://${window.location.hostname}:8787/api/File/UploadMaterial`,
            {
                method: "POST", 
                body: formData
            }
        );

        const data = await response.json();
        return data;
    } catch {
        return false;
    }
}

export async function UploadTokenImage(material){
    try{

        const formData = new FormData();
    formData.append("file", material);


        const response = await fetch(`http://${window.location.hostname}:8787/api/File/UploadToken`,
            {
                method: "POST", 
                body: formData
            }
        );

        const data = await response.json();
        return data;
    } catch {
        return false;
    }
}