"use strict";
const mat4 = glMatrix.mat4;
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const objectsToDraw  = []
const linesToDrawn = []

const CHUNK_X = 32;
const CHUNK_Y = 16;
const CHUNK_Z = 32;

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
    
    const viewProjectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
        useTextures: gl.getUniformLocation(program, `u_useTextures`),
        face: gl.getUniformLocation(program, `u_face`),
    };

    const camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1e-4, 10000);
    eventsListeners(camera, linesToDrawn);

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
            let block = new Object(gl);
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
            for (let j=highest[i][k]; j > 0; --j){
                if(noise.simplex3(i * noiseScale, j * noiseScale, k * noiseScale) > -.5){
                    chunk[i][j][k] = 1;
                    let block = new Object(gl);
                    objectsToDraw.push(block);
                    //block.bindAttribuites(program, gl, cubeBuffer, textcoordBuffer);
                    block.SetPosition(i, j, -k);
                    block.matrixMultiply()
                    if(j > 3){
                        block.SetBlockType(grassBlock);
                    }
                    else {
                        block.SetBlockType(sandBlock);
                    }

                }
                else{
                    chunk[i][j][k] = 0;
                }
                if(j==highest[i][k]){
                    if(Math.random() <= 0.01){
                        for(let w=0; w<4;w++){
                            chunk[i][j+1+w][k] = 1;
                            let block = new Object(gl);
                            objectsToDraw.push(block);
                            //block.bindAttribuites(program, gl, cubeBuffer, textcoordBuffer);
                            block.SetPosition(i, j+1+w, -k);
                            block.matrixMultiply()
                            block.SetBlockType(woodBlock);
                        }
                    }
                }
            }
        }
    }

    for (let i = 0; i < 5; ++i){
        for (let j=0; j < 5; ++j){
            let initialLine = new Line(gl);
            linesToDrawn.push(initialLine);
            initialLine.setInitialPos([i, 0, -j]);
            initialLine.setLenght(Math.floor(10*noise.perlin2(i/5, j/5)));
            initialLine.computeLine();
        }
    }

    addEventListener('keydown', (event) => {
        if(event.key == "w"){
            camera.translationW();
        }
        if(event.key == "s"){
            camera.translationS();
        }
        if(event.key == "a"){
            camera.translationA();
        }
        if(event.key == "d"){
            camera.translationD();
        }
        if(event.key == "q"){
            camera.translationQ();
        }
        if(event.key == "e"){
            camera.translationE();
        }
        if(event.key == "k"){
            console.log(camera.Position());
        }
        if(event.key == "h"){
            wireFrame = !(wireFrame);
        }
        if(event.key == "t"){
            useTextures = !(useTextures);
        }
        if(event.key == "l"){
            linesToDrawn[0].setInitialPos(camera.Position());
            linesToDrawn[0].setLenght(20);
        }
        if(event.key == "i"){
            noiseScale += .1;
        }
        if(event.key == "o"){
            noiseScale -= .1;
        }
    });
    
    addEventListener('keyup', (event) => {
        //console.log("Key up: " + event.key);
    });

    requestAnimationFrame(drawScene);
    function drawScene () {

        gl.useProgram(program);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        camera.ComputeView();
        mat4.multiply(viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);

        gl.bindVertexArray(lineVAO);
        linesToDrawn.forEach(function(line) {
            line.computeLine();
            mat4.multiply(mvpMatrix, viewProjectionMatrix, line.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform1i(uniformLocation.useTextures, 0);
            gl.drawArrays(gl.LINES, 0, 2);
        })

        gl.bindVertexArray(cubeVAO);
        objectsToDraw.forEach(function(objeto) {
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objeto.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform2fv(uniformLocation.face, objeto.GetBlockType());
            gl.uniform1i(uniformLocation.useTextures, useTextures);

            if(wireFrame){
                gl.drawArrays(gl.LINE_STRIP, 0, vertexData.length / 4);
            }
            else{
                gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 4);
            }
        });

        requestAnimationFrame(drawScene);
    }
}

main();