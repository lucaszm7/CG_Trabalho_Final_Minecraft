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
    let wireFrame = false;
    const vertexData = [
        
        //Frente
        -.5, 0.5, 0.5,  
        0.5, 0.5, 0.5, 
        0.5, -.5, 0.5,  

        -.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        -.5, -.5, 0.5,


        // Esquerda
        -.5, 0.5, 0.5,
        -.5, -.5, 0.5,
        -.5, 0.5, -.5,

        -.5, 0.5, -.5,
        -.5, -.5, 0.5,
        -.5, -.5, -.5,


        // Atrás
        -.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, 0.5, -.5,

        0.5, 0.5, -.5,
        -.5, -.5, -.5,
        0.5, -.5, -.5,


        // Direita
        0.5, 0.5, -.5,
        0.5, -.5, -.5,
        0.5, 0.5, 0.5,

        0.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        0.5, -.5, -.5,


        // Cima
        0.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, 0.5,

        -.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, -.5,


        // Baixo
        0.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, 0.5,

        -.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, -.5,
    ];
    const cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,0,1,1,1]), gl.STATIC_DRAW);

    if (!lineBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    const viewProjectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
        changeColors: gl.getUniformLocation(program, `u_changeColors`),
    };

    const camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1e-4, 1000);

    for (let i = 0; i < 64; ++i){
        for (let j=0; j < 64; ++j){
            let initialObject = new Object(gl);
            objectsToDraw.push(initialObject);
            initialObject.bindAttribuites(program, gl, cubeBuffer);
            initialObject.translationX = i;
            initialObject.translationZ = j;
            initialObject.translationY = Math.floor(10*noise.perlin2(i/5, j/5));
            initialObject.matrixMultiply();
        }
    }

    eventsListeners(camera);

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
        if(event.key == "l"){
            linesToDrawn[0].setInitialPos(camera.position());
            linesToDrawn[0].setLenght(20);
        }
    });
    
    addEventListener('keyup', (event) => {
        //console.log("Key up: " + event.key);
    });

    for (let i = 0; i < 5; ++i){
        for (let j=0; j < 5; ++j){
            let initialLine = new Line(gl);
            linesToDrawn.push(initialLine);
            initialLine.bindAttribuites(program, gl, lineBuffer);
            initialLine.setInitialPos([i, 0, j]);
            initialLine.setLenght(Math.floor(10*noise.perlin2(i/5, j/5)));
            initialLine.computeLine();
        }
    }

    requestAnimationFrame(drawScene);
    function drawScene () {
        
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        linesToDrawn.forEach(function(line) {
            gl.useProgram(program);
            gl.bindVertexArray(line.vao);
            //gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
    
            camera.computeView();
            line.computeLine();
            mat4.multiply(viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);
            mat4.multiply(mvpMatrix, viewProjectionMatrix, line.modelMatrix);
    
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.drawArrays(gl.LINES, 0, 2);
        })

        objectsToDraw.forEach(function(objeto) {
            
            //gl.useProgram(program);
            gl.bindVertexArray(objeto.vao);
            //gl.enable(gl.CULL_FACE);
            //gl.enable(gl.DEPTH_TEST);
            
            objeto.matrixMultiply();
            camera.computeView();

            mat4.multiply(viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objeto.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform1i(uniformLocation.changeColors, objeto.changeColors);

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