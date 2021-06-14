"use strict";
const mat4 = glMatrix.mat4;
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const objectsToDraw  = []
const linesToDrawn = []

const CHUNK_X = 64;
const CHUNK_Y = 8;
const CHUNK_Z = 64;

function main() {

    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error ("WebGL not supported");
    }

    noise.seed(Math.random());
    var wireFrame = false;
    var useTextures = true;

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const vertexData = [
        
        //Frente
        0.5, 0.5, 0.5, 0,  //top right
        -.5, 0.5, 0.5, 0,  //top left
        -.5, -.5, 0.5, 0,  //bottom right

        0.5, 0.5, 0.5, 0,  //top left
        -.5, -.5, 0.5, 0,  //bottom left
        0.5, -.5, 0.5, 0,  //bottom right


        // Esquerda
        -.5, 0.5, 0.5, 1,
        -.5, 0.5, -.5, 1,
        -.5, -.5, -.5, 1,

        -.5, 0.5, 0.5, 1,
        -.5, -.5, -.5, 1,
        -.5, -.5, 0.5, 1,


        // Atrás
        -.5, 0.5, -.5, 2,
        0.5, 0.5, -.5, 2,
        0.5, -.5, -.5, 2,

        -.5, 0.5, -.5, 2,
        0.5, -.5, -.5, 2,
        -.5, -.5, -.5, 2,


        // Direita
        0.5, 0.5, -.5, 3,
        0.5, 0.5, 0.5, 3,
        0.5, -.5, 0.5, 3,

        0.5, 0.5, -.5, 3,
        0.5, -.5, 0.5, 3,
        0.5, -.5, -.5, 3,


        // Cima
        0.5, 0.5, -.5, 4,
        -.5, 0.5, -.5, 4,
        -.5, 0.5, 0.5, 4,
        
        0.5, 0.5, -.5, 4,
        -.5, 0.5, 0.5, 4,
        0.5, 0.5, 0.5, 4,


        // Baixo
        0.5, -.5, 0.5, 5,
        -.5, -.5, 0.5, 5,
        -.5, -.5, -.5, 5,

        0.5, -.5, 0.5, 5,
        -.5, -.5, -.5, 5,
        0.5, -.5, -.5, 5,
    ];

    const textcoordData = repeat(6, [
            0, 0, // top left
            1, 0, // top right
            1, 1, // bottom right
        
            0, 0, // top left
            1, 1, // bottom right
            0, 1  // bottom left
    ]);

    const colorData = setColorData();

    const grassBlock = [3,0, 3,0, 3,0, 3,0, 2,9, 2,0];
    const stoneBlock = [0,1, 0,1, 0,1, 0,1, 0,1, 0,1];
    const TNTBlock = [8,0, 8,0, 8,0, 8,0, 9,0, 10,0];
    const sandBlock = [2,1, 2,1, 2,1, 2,1, 2,1, 2,1];
    const woodBlock = [4,1, 4,1, 4,1, 4,1, 5,1, 5,1];
    const leafBlock = [5,3, 5,3, 5,3, 5,3, 5,3, 5,3];
    const cloudBlock = [6,10, 7,10, 6,10, 7,10, 7,10, 6,10];

    const cubeVAO = gl.createVertexArray();

    gl.bindVertexArray(cubeVAO);

    const cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    let positionLocation = gl.getAttribLocation(program, `a_position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);


    const textcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textcoordData), gl.STATIC_DRAW);

    let textcoordLocation = gl.getAttribLocation(program, `a_textcoord`);
    gl.enableVertexAttribArray(textcoordLocation);
    gl.vertexAttribPointer(textcoordLocation, 2, gl.FLOAT, true, 0, 0);


    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    let colorLocation = gl.getAttribLocation(program, `a_color`);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);



    const lineVAO = gl.createVertexArray();
    gl.bindVertexArray(lineVAO);

    const lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,1,1,1]), gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const colorLineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorLineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 255, 255]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);


    const texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    // Asynchronously load an image
    var image = new Image();
    image.src = "textures/atlas_minecraft.png";
    image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
    
    //const viewProjectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
        useTextures: gl.getUniformLocation(program, `u_useTextures`),
        face: gl.getUniformLocation(program, `u_face`),
    };

    const camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1e-4, 10000);
    eventsListeners(camera, linesToDrawn);


    // ===== GERAÇÃO DO MUNDO ===== //

    const world = [];     //- Matrix de chunks
    const chunk = [];     //- Guarda a info de todos blocos no chunk    
    const highest = [];
    var noiseScale = .01;

    for (let i = 0; i < CHUNK_X; ++i){
        chunk[i] = [];
        highest[i] = [];
        for (let j=0; j < CHUNK_Y*2; ++j){
            chunk[i][j] = [];
            for(let k = 0; k < CHUNK_Z; ++k){
                highest[i][k] = 0;
                chunk[i][j][k] = 0;
            }
        }
    }

    for (let i = 0; i < CHUNK_X; ++i){
        for (let k=0; k < CHUNK_Z; ++k){
            let block = new Object();
            objectsToDraw.push(block);
            //block.bindAttribuites(program, gl, cubeBuffer, textcoordBuffer);
            block.SetPosition(i, Math.floor(CHUNK_Y/2 * ((noise.simplex2(i*noiseScale, k*noiseScale)) + 1)), -k);
            highest[i][k] = block.translationY;
            if(block.translationY < 3){
                block.SetBlockType(sandBlock);
            }
            else{
                block.SetBlockType(grassBlock);
            }
            block.matrixMultiply();
        }
    }

    for (let i = 0; i < CHUNK_X; ++i){
        for(let k = 0; k < CHUNK_Z; ++k){
            for (let j=highest[i][k] - 1; j > 0; --j){
                chunk[i][j][k] = 1;
                let block = new Object(i, j, -k);
                objectsToDraw.push(block);
                if(j > 3){
                    block.SetBlockType(grassBlock);
                }
                else if(j < 3 && highest[i][k] < 3) {
                    block.SetBlockType(sandBlock);
                }
                else{
                    block.SetBlockType(stoneBlock)
                }

                //Make a Tree
                if(j==highest[i][k]-1 && highest[i][k] > 3){
                    if(Math.random() <= 0.003){

                        //Wood
                        for(let w=0; w<4;w++){
                            chunk[i][j+1+w][k] = 1;
                            let block = new Object(i, j+2+w, -k);
                            objectsToDraw.push(block);
                            block.SetBlockType(woodBlock);
                        }

                        //Leafs
                        for(let m=-2; m<=2; ++m){
                            for(let n=-2; n<=2; ++n){
                                let block = new Object(m+i, j+5, -k+n);
                                objectsToDraw.push(block);
                                block.SetBlockType(leafBlock);
                            }
                            for(let n=-1; n<=1; ++n){
                                if(m==0 || n==0){
                                    let block = new Object(m+i, j+6, -k+n);
                                    objectsToDraw.push(block);
                                    block.SetBlockType(leafBlock);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //Geração das nuvens
    for (let i = -CHUNK_X/2; i < CHUNK_X*1.5; ++i){
        for(let k = -CHUNK_Z/2; k < CHUNK_Z*1.5; ++k){
            let cloudHeight = noise.perlin2(i*noiseScale*5, k*noiseScale*5);
            if(cloudHeight > 0.2) {
                let cloud = new Object(i, 30 + Math.floor((cloudHeight*3)), -k);
                objectsToDraw.push(cloud);
                cloud.SetBlockType(cloudBlock);
            }
        }
    }

    // Debug Lines
    // for (let i = 1; i < 5; ++i){
    //     for (let j=1; j < 5; ++j){
    //         let initialLine = new Line([i, 0, -j], [32,16,-12]);
    //     }
    // }


    // ===== INPUTS ===== //

    addEventListener('keydown', (event) => {
        if(event.key == "w"){
            camera.translationW();
        }
        else if(event.key == "s"){
            camera.translationS();
        }
        else if(event.key == "a"){
            camera.translationA();
        }
        else if(event.key == "d"){
            camera.translationD();
        }
        else if(event.key == "q"){
            camera.translationQ();
        }
        else if(event.key == "e"){
            camera.translationE();
        }
        else if(event.key == "k"){
            console.log(formatedFloat(camera.Position()[0]), formatedFloat(camera.Position()[1]), formatedFloat(camera.Position()[2]));
        }
        else if(event.key == "h"){
            wireFrame = !(wireFrame);
        }
        else if(event.key == "t"){
            useTextures = !(useTextures);
        }
        else if(event.key == "l"){
            let line = new Line(camera.Position(), [camera.Normal()[0]+camera.Position()[0], camera.Normal()[1]+camera.Position()[1], camera.Normal()[2]+camera.Position()[2]]);
            console.log(line);
        }
    });
    
    addEventListener('keyup', (event) => {
        //console.log("Key up: " + event.key);
    });

    addEventListener('click', (event) => {
        if(event.button === 0){
            //Remove 1 bloco que está apontando
            let closestDistance = 2;
            let closestIndex;
            objectsToDraw.forEach(function(objeto, index) {
                if(distancia(camera.Position(), objeto.GetPosition()) <= 2){
                    let d = distancia([camera.Normal()[0]+camera.Position()[0], camera.Normal()[1]+camera.Position()[1], camera.Normal()[2]+camera.Position()[2]], objeto.GetPosition())
                    console.log(formatedFloat(d));
                    if (d < closestDistance && d < 1){
                        let retiraLine = new Line([camera.Normal()[0]+camera.Position()[0], camera.Normal()[1]+camera.Position()[1], camera.Normal()[2]+camera.Position()[2]], objeto.GetPosition())
                        closestIndex = index;
                        closestDistance = d;
                    }
                }
            });
            if(closestDistance < 1){
                objectsToDraw.splice(closestIndex, 1);
            }
            //console.log(d);
        }
        else if(event.button === 2){
            //Coloca um bloco aonde está apontando
            let closestDistance = 2;
            let closestIndex;
            objectsToDraw.forEach(function(objeto, index) {
                if(distancia(camera.Position(), objeto.GetPosition()) <= 2){
                    let d = distancia([camera.Normal()[0]+camera.Position()[0], camera.Normal()[1]+camera.Position()[1], camera.Normal()[2]+camera.Position()[2]], objeto.GetPosition())
                    //console.log(formatedFloat(d));
                    if (d < closestDistance && d < 1){
                        let retiraLine = new Line([camera.Normal()[0]+camera.Position()[0], camera.Normal()[1]+camera.Position()[1], camera.Normal()[2]+camera.Position()[2]], objeto.GetPosition())
                        closestIndex = index;
                        closestDistance = d;
                    }
                }
            });
            if(closestDistance < 1){
                //let distanceBetween = [Math.floor(camera.Position()[0] - objectsToDraw[closestIndex].GetPosition()[0]), Math.floor(camera.Position()[1] - objectsToDraw[closestIndex].GetPosition()[1]), Math.floor(camera.Position()[2] - objectsToDraw[closestIndex].GetPosition()[2])];
                //console.log(distanceBetween);
                let block = new Object(Math.round(camera.Normal()[0]+camera.Position()[0]), Math.round(camera.Normal()[1]+camera.Position()[1]), Math.round(camera.Normal()[2]+camera.Position()[2]));
                block.SetBlockType(TNTBlock);
                if(block.GetPosition() == objectsToDraw[closestIndex].GetPosition()){
                    console.log("Its Equal!!!!!!");
                }
                objectsToDraw.push(block);
                console.log(formatedFloat(block.GetPosition()[0]), formatedFloat(block.GetPosition()[1]), formatedFloat(block.GetPosition()[2]))
            }
        }
    });

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    // const objectsToDrawSorted = objectsToDraw.sort((a, b) => a.translationZ < b.translationZ)
    // console.log(objectsToDrawSorted);

    requestAnimationFrame(drawScene);
    function drawScene (time) {

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        camera.ComputeView();
        camera.ComputeViewProjection();

        gl.bindVertexArray(lineVAO);
        linesToDrawn.forEach(function(line) {
            mat4.multiply(mvpMatrix, camera.viewProjectionMatrix, line.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform1i(uniformLocation.useTextures, 0);
            gl.drawArrays(gl.LINES, 0, 2);
        })

        gl.bindVertexArray(cubeVAO);
        objectsToDraw.forEach(function(objeto) {
            //if((Math.abs(objeto.GetPosition()[0] - camera.Position()[0]) < 64) && (Math.abs(objeto.GetPosition()[1] - camera.Position()[1]) < 8) && (Math.abs(objeto.GetPosition()[2] - camera.Position()[2]) < 64)){
                mat4.multiply(mvpMatrix, camera.viewProjectionMatrix, objeto.modelMatrix);
                gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
                gl.uniform2fv(uniformLocation.face, objeto.GetBlockType());
                gl.uniform1i(uniformLocation.useTextures, useTextures);

                if(wireFrame){
                    gl.drawArrays(gl.LINE_STRIP, 0, vertexData.length / 4);
                }
                else{
                    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 4);
                }
            //}
        });

        requestAnimationFrame(drawScene);
    }
}

main();