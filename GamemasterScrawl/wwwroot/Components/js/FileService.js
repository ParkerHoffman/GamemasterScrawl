
        /*
            Get Call:
            const response = await fetch("http://172.25.3.231:8787/api/File/UploadMaterial")
        */

export async function UploadMaterial(material){
    try{
        const response = await fetch(`http://${window.location.hostname}:8787/api/File/UploadMaterial`,
            {
                method: "POST", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(material)
            }
        );

        const data = await response.json();
        return data;
    } catch {
        return false;
    }
}