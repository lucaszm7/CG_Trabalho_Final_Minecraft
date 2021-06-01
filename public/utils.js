// class GUIRoot {
//     constructor(vertexData, program, gl, gui, objectsToDraw) {
//         this.vertexData = vertexData;
//         this.program = program;
//         this.gl = gl;
//         this.gui = gui;
//         this.objectsToDraw = objectsToDraw;
//     }
    
//     addObject() {
//         var objeto = new Objeto(this.vertexData, this.gl)
//         this.objectsToDraw.push(objeto);
//         objeto.bindAttribuites(this.program, this.gl);
//         GUIAddObject(gui, objeto, this.objectsToDraw);
//     }
// }

// class Animation {
//     constructor(gl, gui, program, objectsToDraw, camera, viewProjectionMatrix, mvpMatrix){
//         this.program = program;
//         this.gl = gl;
//         this.gui = gui;
//         this.objectsToDraw = objectsToDraw;
//         this.camera = camera;
//         this.object = null;
//         this.uniformLocation = {
//             mvpMatrix: this.gl.getUniformLocation(this.program, `u_mvpMatrix`),
//         };
        
//         this.viewProjectionMatrix = viewProjectionMatrix;
//         this.mvpMatrix = mvpMatrix
    
//         this.rotationSpeed = radToDeg(1.2);
//         this.then = 0;
//         //Radianos por segundo
//     }
//     callAnimete(){
//         requestAnimationFrame(this.animate);
//     }
//     animate(now){
//         if(now == null){
//             now = 0;
//         }
//         now *= 0.001;
//         var deltaTime = now - this.then;
//         this.then = now;

//         this.gl.useProgram(this.program);
//         this.gl.bindVertexArray(this.objectsToDraw[this.object].vao);
//         this.gl.enable(this.gl.DEPTH_TEST);
        
//         this.objectsToDraw[this.object].rotationX += this.rotationSpeed * deltaTime;
//         console.log(this.objectsToDraw[this.object].rotationX);
//         this.objectsToDraw[this.object].matrixMultiply();
//         this.camera.computeView();
//         this.camera.computeProjection();

//         mat4.multiply(this.viewProjectionMatrix, this.camera.viewMatrix, this.camera.projectionMatrix);
//         mat4.multiply(this.mvpMatrix, this.viewProjectionMatrix, this.objectsToDraw[this.object].modelMatrix);
        
//         this.gl.uniformMatrix4fv(this.uniformLocation.mvpMatrix, false, this.mvpMatrix);
//         this.gl.drawArrays(this.gl.TRIANGLES, 0, this.objectsToDraw[this.object].vertexData.length / 3);

//         if(this.objectsToDraw[this.object].rotationX <= 60){
//             requestAnimationFrame(this.animate);
//         }
//     }
// }
class Camera {
    constructor(fieldOfView, aspectRatio, near, far){
        this.up = [0, 1, 0];
        this.viewMatrix = mat4.create();
        this.viewX = 0;
        this.viewY = 0;
        this.viewZ = 10;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.projectionMatrix = mat4.create();
        this.fieldOfView = fieldOfView;
        this.aspectRatio = aspectRatio;
        this.near = near;
        this.far = far;
        mat4.perspective(this.projectionMatrix,
                        degToRad(fieldOfView),
                        aspectRatio,
                        near,
                        far);
    }
    computeProjection(){
        mat4.perspective(this.projectionMatrix,
            degToRad(this.fieldOfView),
            this.aspectRatio,
            this.near,
            this.far);
    }
    computeView(lookingAt=[0,0,0]){
        var cameraMatrix = mat4.create();
        mat4.targetTo(cameraMatrix, [this.viewX,this.viewY,this.viewZ], lookingAt, this.up);
        mat4.rotateX(cameraMatrix, cameraMatrix, degToRad(this.rotationX));
        mat4.rotateY(cameraMatrix, cameraMatrix, degToRad(this.rotationY));
        mat4.rotateZ(cameraMatrix, cameraMatrix, degToRad(this.rotationZ));
        mat4.translate(cameraMatrix, cameraMatrix, [this.viewX, this.viewY, this.viewZ]);
        
        mat4.invert(this.viewMatrix, cameraMatrix);
    }
}
class Objeto {
    constructor(vertexData, gl){
        this.translationX = 0;
        this.translationY = 0;
        this.translationZ = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;
        this.vertexData = vertexData;
        this.changeColors = false;
        this.lookAt = false;
        this.colorData = setColorData();
        this.vao = gl.createVertexArray();
        this.modelMatrix = mat4.create();
        this.matrixMultiply();
    };

    //For n attribuites: create another paramenter "indexAttribuites"
    //that is a list with the string with the names of all attribuites;
    bindAttribuites(program, gl, positionBuffer){
        gl.bindVertexArray(this.vao);
        let positionLocation = gl.getAttribLocation(program, `a_position`);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        
        let colorBuffer = gl.createBuffer();
        let colorLocation = gl.getAttribLocation(program, `a_color`);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(colorLocation);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorData), gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    };

    matrixMultiply() {
        let auxMatrix = mat4.create();
        mat4.translate(auxMatrix, auxMatrix, [this.translationX,this.translationY,this.translationZ]);
        mat4.rotateX(auxMatrix, auxMatrix, degToRad(this.rotationX));
        mat4.rotateY(auxMatrix, auxMatrix, degToRad(this.rotationY));
        mat4.rotateZ(auxMatrix, auxMatrix, degToRad(this.rotationZ));
        mat4.scale(this.modelMatrix, auxMatrix, [this.scaleX,this.scaleY,this.scaleZ]);
    };

    position(){
        return [this.modelMatrix[12],this.modelMatrix[13],this.modelMatrix[14]];
    }
}
function splineCurve(matrix, TransC, x, y){
    var t = TransC*0.01;
    var xout = (1-t)*((1-t)*((1-t)*x[0] + t*x[1]) + t*((1-t)*x[1] + t*x[2])) + t*((1-t)*((1-t)*x[1] + t*x[2]) + t*((1-t)*x[2] + t*x[3]));
    var yout = (1-t)*((1-t)*((1-t)*y[0] + t*y[1]) + t*((1-t)*y[1] + t*y[2])) + t*((1-t)*((1-t)*y[1] + t*y[2]) + t*((1-t)*y[2] + t*y[3]));
  
    mat4.translate(matrix. matrix, xout);
    mat4.translate(matrix. matrix, yout);
  
    return matrix;
  }
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
function radToDeg(r) {
    return r * 180 / Math.PI;
}
function randomColor () {
    return [ Math.random(), Math.random(), Math.random()];
}
function setColorData () {
    let colorDataAux = [];
    for (let face = 0; face < 6; face++){
        let faceColor = randomColor();
        for (let vertex = 0; vertex < 6; vertex++){
            colorDataAux.push(...faceColor);
        }
    }
    return colorDataAux;
}
function compileShader(gl, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
};
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw ("program filed to link:" + gl.getProgramInfoLog (program));
    }
    return program;
};

const vertexShaderSource = 
`#version 300 es

uniform mat4 u_mvpMatrix;
uniform vec2 u_resolution;

in vec3 a_position;
in vec3 a_color;

out vec3 v_color;
out vec4 v_position;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1);

    v_position = gl_Position;
    v_color = a_color;
}
`;
const fragmentShaderSource = 
`#version 300 es
precision highp float;

in vec3 v_color;
in vec4 v_position;

out vec4 outColor;

uniform int u_changeColors;

void main() {
    if(u_changeColors == 0){
        outColor = vec4(v_color, 1.0);
    }
    else {
        outColor = v_position + vec4(v_color, 1.0);
    }
}
`;