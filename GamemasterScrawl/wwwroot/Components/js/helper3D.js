import * as THREE from 'three';



    const geometry = new THREE.BoxGeometry(1,1,1);
    // Initialize the Texture Loader
    export const loader = new THREE.TextureLoader();
    //Path to the material Folder
    export const rootPathMat = `/Components/FileMaterials/Materials`;
    //Path to the Token Folder
    export const rootPathTok = `/Components/FileMaterials/TokenImages`;

    //Cube constants
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });


export function getTokenImage(ref){

}

function createVisibleToken(token){
        const imgPath = token.tokenRef?.imgRef
        ? `/Components/FileMaterials/TokenImages/${token.tokenRef.imgRef}`
        : "/Components/FileMaterials/Assets/DefaultToken.png";

        const texture = loader.load(imgPath);

        const geometry = new THREE.CircleGeometry(0.5, 32);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(token.x, token.y, token.z);

    mesh.onBeforeRender = (renderer, scene, camera) => {
        mesh.quaternion.copy(camera.quaternion);
    };

    mesh.userData.id = token.id;
    mesh.renderOrder = 999;

    return mesh;
}

export function createSpecialBlock(block){
            const geometry = new THREE.TorusKnotGeometry( .3, .02, 64, 8 , generateRandomNumber(1, 21), generateRandomNumber(1, 21))
            const material = new THREE.MeshBasicMaterial( { color: block.material } );
            const magicTorus = new THREE.Mesh( geometry, material );

            //Setting a random rotation speed
            magicTorus.userData.rotation = {    x: generateRandomNumber(1, 9) * .1, y: generateRandomNumber(1, 9) * .1, }
            magicTorus.userData.stutterInterval = generateRandomNumber(1, 9) * .1;

            magicTorus.userData.stutterTimer = 0;

            return magicTorus;
}

export function make3DBlock(imgRef, moreArgs){

    var material = new THREE.MeshBasicMaterial({color: imgRef || "#aaaaaa", transparent: true, opacity: 0});
    if(imgRef !== null){

        try{
            var texture =  loader.load(
                `${rootPathMat}/${imgRef}`,
                //On success: We don't care
                undefined,
                //On Progress: We don't care
                undefined,
                //On error:
                undefined
            );
    
             material = new THREE.MeshBasicMaterial({map: texture, ...moreArgs});
        } catch {
            
        }
            
    } else {
       material = new THREE.MeshBasicMaterial({color: "#b200ed", transparent: true, opacity: 0});
    }
    const cube = new THREE.Mesh(geometry, material);

    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    if(imgRef !== null)
    {
            cube.add(edgeLines);
    }


    return cube;
}



export function generateRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}

export function clearScene(scene){
    for(let i = scene.children.length - 1; i >= 0; i--){
            const obj = scene.children[i];
            if(obj.userData?.persistent) continue;
            scene.remove(obj);
    }
}


export function renderRoom(scene, room, doTokens){
    clearScene(scene);

    const maxDims = getRoomBounds(room);

    renderRoomBounds(scene, maxDims);
    
    room.blockList.forEach(block => {
        if(block.isInteractable && block.isInteractable === true){
            

            const magicTorus = createSpecialBlock(block);
                magicTorus.position.x = block.x;
                magicTorus.position.y = block.y;
                magicTorus.position.z = block.z;

            const magicTorusCube = make3DBlock(null);

                magicTorusCube.position.x = block.x;
                magicTorusCube.position.y = block.y;
                magicTorusCube.position.z = block.z;

                scene.add(magicTorusCube)
                scene.add(magicTorus)

        } else {
        const cube = make3DBlock(block.material);
        cube.position.x = block.x;
        cube.position.y = block.y;
        cube.position.z = block.z;

        scene.add(cube);
        }


    })

    if(doTokens){
            room.tokens.forEach((token) => {
                const tokenCover = make3DBlock(null);

                tokenCover.position.x = token.x;
                tokenCover.position.y = token.y;
                tokenCover.position.z = token.z;

                tokenCover.userData.id = token.id;

                const tokenObject =  createVisibleToken(token);
                
                scene.add(tokenObject);
                scene.add(tokenCover)


            })
    }
}


function getRoomBounds(room){
    return {
        x: room.xDimension,
        y: room.yDimension,
        z: room.zDimension,

        maxX: room.xDimension - 1,
        maxY: room.yDimension - 1,
        maxZ: room.zDimension - 1

    }
}


function renderRoomBounds(scene, bounds){
    const geometry = new THREE.BoxGeometry(
        bounds.x, bounds.y, bounds.z
    )

    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({color: 0x3688f4})

    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.set(
        bounds.x / 2 - .5,
        bounds.y / 2 - .5,
        bounds.z / 2 - .5
    );

    scene.add(wireframe);
}

export async function Generate3DSpace(container, contName, appState, renderer, camera, scene, controls){

    appState.sceneSet.add({renderer: renderer, scene: scene})

        renderer.setClearColor(0x000000, 0); // transparent background
        renderer.setSize(window.innerWidth, window.innerHeight);

    var spaceCont = container.querySelector(contName);

    spaceCont.appendChild(renderer.domElement);

        camera.position.z = 15;

        let lastTime = performance.now();

        function animate() {
            //Require damping is true, and thus I must update the controls
            controls.update(); 

    renderer.render(scene, camera);
}

renderer.setAnimationLoop( animate );
}