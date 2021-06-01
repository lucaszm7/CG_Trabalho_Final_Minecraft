"use strict";
const mat4 = glMatrix.mat4;
const vec2 = glMatrix.vec2;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const objectsToDraw  = []

function main() {

    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        throw new Error ("WebGL not supported");
    }

    noise.seed(Math.random());

    canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;
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

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    const viewProjectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    const uniformLocation = {
        mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
        changeColors: gl.getUniformLocation(program, `u_changeColors`),
    };

    var then_animation = 0;
    // var animation = {
    //     //Graus por segundo
    //     rotationSpeed: 20,
    //     translationSpeed: 1,
    //     indexOfObjeto: 0,
    //     objetos: [0, 1, 2, 3, 4],
    //     objetoId: "",
    //     idOfObjetos: ["element"],
    //     rotationBeginX: null,
    //     rotationBeginY: null,
    //     rotationBeginZ: null,
    //     rotationX: 0,
    //     rotationY: 0,
    //     rotationZ: 0,
    //     translationBeginX: null,
    //     translationBeginY: null,
    //     translationBeginZ: null,
    //     translationX: 0,
    //     translationY: 0,
    //     translationZ: 0,
    //     animateRotate: function(){
    //         requestAnimationFrame(animation.rotate);
    //     },
    //     animateTranslate: function(){
    //         requestAnimationFrame(animation.translate);
    //     },
    //     animateMaster: function(){
    //         requestAnimationFrame(animation.translate);
    //         requestAnimationFrame(animation.rotate);
    //     },
    //     rotate: function (now) {
    //         now *= 0.001;
    //         if(then_animation == 0){
    //             then_animation = now;
    //             animation.rotationBeginX = objectsToDraw[animation.indexOfObjeto].rotationX;
    //             animation.rotationBeginY = objectsToDraw[animation.indexOfObjeto].rotationY;
    //             animation.rotationBeginZ = objectsToDraw[animation.indexOfObjeto].rotationZ;
    //         }
    //         var deltaTime = now - then_animation;
    //         then_animation = now;
    //         gl.useProgram(program);
    //         gl.bindVertexArray(objectsToDraw[animation.indexOfObjeto].vao);
    //         //gl.enable(gl.CULL_FACE);
    //         gl.enable(gl.DEPTH_TEST);
            
    //         if(objectsToDraw[animation.indexOfObjeto].rotationX - animation.rotationBeginX <= animation.rotationX){
    //             objectsToDraw[animation.indexOfObjeto].rotationX += animation.rotationSpeed * deltaTime;
    //         }
    //         if(objectsToDraw[animation.indexOfObjeto].rotationY - animation.rotationBeginY <= animation.rotationY){
    //             objectsToDraw[animation.indexOfObjeto].rotationY += animation.rotationSpeed * deltaTime;
    //         }
    //         if(objectsToDraw[animation.indexOfObjeto].rotationZ - animation.rotationBeginZ <= animation.rotationZ){
    //             objectsToDraw[animation.indexOfObjeto].rotationZ += animation.rotationSpeed * deltaTime;
    //         }
    //         objectsToDraw[animation.indexOfObjeto].matrixMultiply();
    //         camera.computeView();
    //         camera.computeProjection();

    //         mat4.multiply(viewProjectionMatrix, camera.viewMatrix, camera.projectionMatrix);
    //         mat4.multiply(mvpMatrix, viewProjectionMatrix, objectsToDraw[animation.indexOfObjeto].modelMatrix);
    //         gl.uniform1i(uniformLocation.changeColors, objectsToDraw[animation.indexOfObjeto].changeColors);
    //         gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
    //         gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
    //         // console.log("objectsToDraw[animation.indexOfObjeto].rotationX: " + objectsToDraw[animation.indexOfObjeto].rotationX);
    //         // console.log("animation.rotationBeginX: " + animation.rotationBeginX);
    //         // console.log("animation.rotationX: " + animation.rotationX);
    //         if(objectsToDraw[animation.indexOfObjeto].rotationX - animation.rotationBeginX <= animation.rotationX
    //             || objectsToDraw[animation.indexOfObjeto].rotationY - animation.rotationBeginY <= animation.rotationY
    //             || objectsToDraw[animation.indexOfObjeto].rotationZ - animation.rotationBeginZ <= animation.rotationZ){
    //             requestAnimationFrame(animation.rotate);
    //         }
    //         else{
    //             animation.rotationBeginX = objectsToDraw[animation.indexOfObjeto].rotationX;
    //             animation.rotationBeginY = objectsToDraw[animation.indexOfObjeto].rotationY;
    //             animation.rotationBeginZ = objectsToDraw[animation.indexOfObjeto].rotationZ;
    //             then_animation = 0;
    //         }
    //     },
    //     translate: function(now){
    //         now *= 0.001;
    //         if(then_animation == 0){
    //             then_animation = now;
    //             animation.translationBeginX = objectsToDraw[animation.indexOfObjeto].translationX;
    //             animation.translationBeginY = objectsToDraw[animation.indexOfObjeto].translationY;
    //             animation.translationBeginZ = objectsToDraw[animation.indexOfObjeto].translationZ;
    //         }
    //         var deltaTime = now - then_animation;
    //         then_animation = now;
    //         gl.useProgram(program);
    //         gl.bindVertexArray(objectsToDraw[animation.indexOfObjeto].vao);
    //         //gl.enable(gl.CULL_FACE);
    //         gl.enable(gl.DEPTH_TEST);
            
    //         if(objectsToDraw[animation.indexOfObjeto].translationX - animation.translationBeginX <= animation.translationX){
    //             objectsToDraw[animation.indexOfObjeto].translationX += animation.translationSpeed * deltaTime;
    //         }
    //         if(objectsToDraw[animation.indexOfObjeto].translationY - animation.translationBeginY <= animation.translationY){
    //             objectsToDraw[animation.indexOfObjeto].translationY += animation.translationSpeed * deltaTime;
    //         }
    //         if(objectsToDraw[animation.indexOfObjeto].translationZ - animation.translationBeginZ <= animation.translationZ){
    //             objectsToDraw[animation.indexOfObjeto].translationZ += animation.translationSpeed * deltaTime;
    //         }
    //         objectsToDraw[animation.indexOfObjeto].matrixMultiply();
    //         camera.computeView();
    //         camera.computeProjection();

    //         mat4.multiply(viewProjectionMatrix, camera.viewMatrix, camera.projectionMatrix);
    //         mat4.multiply(mvpMatrix, viewProjectionMatrix, objectsToDraw[animation.indexOfObjeto].modelMatrix);
    //         gl.uniform1i(uniformLocation.changeColors, objectsToDraw[animation.indexOfObjeto].changeColors);
    //         gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
    //         gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

    //         if(objectsToDraw[animation.indexOfObjeto].translationX - animation.translationBeginX <= animation.translationX
    //             || objectsToDraw[animation.indexOfObjeto].translationY - animation.translationBeginY <= animation.translationY
    //             || objectsToDraw[animation.indexOfObjeto].translationZ - animation.translationBeginZ <= animation.translationZ){
    //             requestAnimationFrame(animation.translate);
    //         }
    //         else{
    //             then_animation = 0;
    //             animation.translationBeginX = objectsToDraw[animation.indexOfObjeto].translationX;
    //             animation.translationBeginY = objectsToDraw[animation.indexOfObjeto].translationY;
    //             animation.translationBeginZ = objectsToDraw[animation.indexOfObjeto].translationZ;
    //         }
    //     },
    // }

    const camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1, 1000);
    var i, j;
    for (i = 0; i < 30; ++i){
        for (j=0; j < 30; ++j){
            let initialObject = new Objeto(gl);
            objectsToDraw.push(initialObject);
            initialObject.bindAttribuites(program, gl, cubeBuffer);
            initialObject.translationX = i;
            initialObject.translationZ = j
            initialObject.translationY = Math.floor(10*noise.perlin2(i/5, j/5));
            initialObject.matrixMultiply();
            //console.log(initialObject.position());
        }
    }
    var lookingAt = [0,0,0];

    addEventListener('keydown', (event) => {
        console.log(event.key);
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
    });
    
    addEventListener('keyup', (event) => {
        //console.log("Key up: " + event.key);
    });

    canvas.onclick = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            canvas.requestPointerLock()
        }
    }
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            console.log('The pointer lock status is now locked');
            document.addEventListener("mousemove", updateRotation, false);
        } else {
            console.log('The pointer lock status is now unlocked');
            document.removeEventListener("mousemove", updateRotation, false);
        }
    }

    function updateRotation(e) {
        let x = e.movementX;
        let y = e.movementY;
        if(camera.rotationX >= 360 || camera.rotationX >= -360){
            camera.rotationX -= 360;
        }
        if(camera.rotationY >= 360 || camera.rotationY >= -360){
            camera.rotationX -= 360;
        }
        camera.rotationX += (y/2) * -1;
        camera.rotationY += (x/2) * -1;
        console.log("X: " + x + "Y: " + y);
    }


    requestAnimationFrame(drawScene);

    function drawScene () {
        objectsToDraw.forEach(function(objeto) {
            
            gl.useProgram(program);
            gl.bindVertexArray(objeto.vao);
            //gl.enable(gl.CULL_FACE);
            gl.enable(gl.DEPTH_TEST);
            
            objeto.matrixMultiply();
            camera.computeView(lookingAt);
            camera.computeProjection();

            mat4.multiply(viewProjectionMatrix, camera.projectionMatrix, camera.viewMatrix);
            mat4.multiply(mvpMatrix, viewProjectionMatrix, objeto.modelMatrix);
            gl.uniformMatrix4fv(uniformLocation.mvpMatrix, false, mvpMatrix);
            gl.uniform1i(uniformLocation.changeColors, objeto.changeColors);
            gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
        });
        requestAnimationFrame(drawScene);
    }
}

main();