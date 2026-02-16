import * as THREE from 'three';


export function getTokenImage(ref){

}

export function make3DBlock(imgRef){
            const geometry = new THREE.BoxGeometry(1,1,1);
            // Initialize the Texture Loader
            const loader = new THREE.TextureLoader();
    
            var texture;

            try{
                //Attempt to load the texture
                texture = loader.load(`/Components/FileMaterials/Materials/${imgRef}`);
            } catch{
                //Otherwise, load the defaul texture
                texture = loader.load(`/Components/FileMaterials/Materials/Default_Mossy_Stone.jpg`);
            }
            
            //Be sure to credit: https://ambientcg.com/
    
            const material = new THREE.MeshBasicMaterial({map: texture});
            //const material = new THREE.MeshBasicMaterial({color: 0x3688F4});
    
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
     const cube = new THREE.Mesh(geometry, material);

        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        cube.add(edgeLines);

        return cube;
}