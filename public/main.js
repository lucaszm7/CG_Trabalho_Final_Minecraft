"use strict";
const mat4 = glMatrix.mat4;
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const objectsToDraw  = []
const linesToDrawn = []
function main() {

    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error ("WebGL not supported");
    }

    noise.seed(Math.random());
    var wireFrame = false;
    var useTextures = true;

    const vertexData = [
        
        //Frente
        -.5, 0.5, 0.5, 0,  //top left
        0.5, 0.5, 0.5, 0,  //top right
        0.5, -.5, 0.5, 0,  //bottom right

        -.5, 0.5, 0.5, 0,  //top left
        0.5, -.5, 0.5, 0,  //bottom right
        -.5, -.5, 0.5, 0,  //bottom left


        // Esquerda
        -.5, 0.5, -.5, 1,
        -.5, 0.5, 0.5, 1,
        -.5, -.5, 0.5, 1,

        -.5, 0.5, -.5, 1,
        -.5, -.5, 0.5, 1,
        -.5, -.5, -.5, 1,


        // Atrás
        0.5, 0.5, -.5, 2,
        -.5, 0.5, -.5, 2,
        -.5, -.5, -.5, 2,

        0.5, 0.5, -.5, 2,
        -.5, -.5, -.5, 2,
        0.5, -.5, -.5, 2,


        // Direita
        0.5, 0.5, 0.5, 3,
        0.5, 0.5, -.5, 3,
        0.5, -.5, -.5, 3,

        0.5, 0.5, 0.5, 3,
        0.5, -.5, -.5, 3,
        0.5, -.5, 0.5, 3,


        // Cima
        -.5, 0.5, -.5, 4,
        0.5, 0.5, -.5, 4,
        0.5, 0.5, 0.5, 4,

        -.5, 0.5, -.5, 4,
        0.5, 0.5, 0.5, 4,
        -.5, 0.5, 0.5, 4,


        // Baixo
        -.5, -.5, 0.5, 5,
        0.5, -.5, 0.5, 5,
        0.5, -.5, -.5, 5,

        -.5, -.5, 0.5, 5,
        0.5, -.5, -.5, 5,
        -.5, -.5, -.5, 5,
    ];

    const textcoordData = repeat(6, [
            0, 0, // top left
            1, 0, // top right
            1, 1, // bottom right
        
            0, 0, // top left
            1, 1, // bottom right
            0, 1  // bottom left
    ]);

    const grassBlock = [3,0, 3,0, 3,0, 3,0, 2,9, 2,0];
    const TNTBlock = [8,0, 8,0, 8,0, 8,0, 9,0, 10,0];
    const sandBlock = [2,1, 2,1, 2,1, 2,1, 2,1, 2,1, 2,1]

    const cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const textcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textcoordData), gl.STATIC_DRAW);

    const lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,1,1,1]), gl.STATIC_DRAW);

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

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    const viewProjectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
        useTextures: gl.getUniformLocation(program, `u_useTextures`),
        face: gl.getUniformLocation(program, `u_face`),
    };

    const camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1e-4, 1000);
    eventsListeners(camera, linesToDrawn);

    for (let i = 0; i < 64; ++i){
        for (let j=0; j < 64; ++j){
            let initialObject = new Object(gl);
            objectsToDraw.push(initialObject);
            initialObject.bindAttribuites(program, gl, cubeBuffer, textcoordBuffer);
            initialObject.translationX = i;
            initialObject.translationZ = -j;
            initialObject.translationY = Math.floor(16 * noise.perlin2(i/32, j/32));
            if(initialObject.translationY < 0){
                initialObject.SetBlockType(sandBlock);
            }
            else{
                initialObject.SetBlockType(grassBlock);
            }
            initialObject.matrixMultiply();
        }
    }

    for (let i = 0; i < 5; ++i){
        for (let j=0; j < 5; ++j){
            let initialLine = new Line(gl);
            linesToDrawn.push(initialLine);
            initialLine.bindAttribuites(program, gl, lineBuffer);
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
            console.log(camera.position());
        }
        if(event.key == "h"){
            wireFrame = !(wireFrame);
        }
        if(event.key == "t"){
            useTextures = !(useTextures);
        }
        if(event.key == "l"){
            linesToDrawn[0].setInitialPos(camera.position());
            linesToDrawn[0].setLenght(20);
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
        //gl.enable(gl.CULL_FACE);
        camera.computeView();
        mat4.multiply(viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);

        linesToDrawn.forEach(function(line) {
            gl.bindVertexArray(line.vao);
            line.computeLine();
            mat4.multiply(mvpMatrix, viewProjectionMatrix, line.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform1i(uniformLocation.useTextures, 0);
            gl.drawArrays(gl.LINES, 0, 2);
        })

        objectsToDraw.forEach(function(objeto) {
            
            gl.bindVertexArray(objeto.vao);
            objeto.matrixMultiply();
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objeto.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform2fv(uniformLocation.face, objeto.GetBlockType());
            gl.uniform1i(uniformLocation.useTextures, useTextures);

            if(wireFrame){
                gl.drawArrays(gl.LINE_STRIP, 0, vertexData.length / 3);
            }
            else{
                gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
            }
        });

        requestAnimationFrame(drawScene);
    }
}

main();