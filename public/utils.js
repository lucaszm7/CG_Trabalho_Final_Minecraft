class Scene {
    constructor(){

    }
}
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
        //mat4.lookAt(cameraMatrix, [this.viewX,this.viewY,this.viewZ], this.normal(), this.up);
        mat4.translate(cameraMatrix, cameraMatrix, [this.viewX, this.viewY, this.viewZ]);
        mat4.rotateY(cameraMatrix, cameraMatrix, degToRad(this.rotationY));
        mat4.rotateX(cameraMatrix, cameraMatrix, degToRad(this.rotationX));
        //mat4.rotateZ(cameraMatrix, cameraMatrix, degToRad(this.rotationZ));
        
        mat4.invert(this.viewMatrix, cameraMatrix);
    }
    position(){
        return [this.viewMatrix[12],this.viewMatrix[13],this.viewMatrix[14]];
    }
    normal(){
        let normal = vec4.create();
        normal[2] = 1;
        vec4.transformMat4(normal, normal, this.viewMatrix);
        return normal;
    }

    normalSide(){
        let normal = vec4.create();
        normal[0] = 1;
        vec4.transformMat4(normal, normal, this.viewMatrix);
        return normal;
    }

    normalUpDown(){
        let normal = vec4.create();
        normal[1] = 1;
        return normal;
    }

    translationW(velocity=0.2){
        let normal = this.normal();
        this.viewX += (normal[0] * velocity);
        this.viewY += (normal[1] * velocity);
        this.viewZ -= (normal[2] * velocity);
    }
    translationS(velocity=0.2){
        let normal = this.normal();
        this.viewX -= (normal[0] * velocity);
        this.viewY -= (normal[1] * velocity);
        this.viewZ += (normal[2] * velocity);
    }
    translationD(velocity=0.2){
        let normal = this.normalSide();
        this.viewX += (normal[0] * velocity);
        this.viewY += (normal[1] * velocity);
        this.viewZ -= (normal[2] * velocity);
    }
    translationA(velocity=0.2){
        let normal = this.normalSide();
        this.viewX -= (normal[0] * velocity);
        this.viewY -= (normal[1] * velocity);
        this.viewZ += (normal[2] * velocity);
    }
    translationQ(velocity=0.2){
        let normal = this.normalUpDown();
        this.viewX -= (normal[0] * velocity);
        this.viewY -= (normal[1] * velocity);
        this.viewZ += (normal[2] * velocity);
    }
    translationE(velocity=0.2){
        let normal = this.normalUpDown(velocity);
        this.viewX += (normal[0] * velocity);
        this.viewY += (normal[1] * velocity);
        this.viewZ -= (normal[2] * velocity);
    }
}
class Object {
    constructor(gl){
        this.translationX = 0;
        this.translationY = 0;
        this.translationZ = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;
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
class Player {
    constructor(){

    }
}

class Line {
    constructor(gl){
        this.initialPos = vec3.create();
        this.finalPos = vec3.fromValues(1,1,1);
        this.vao = gl.createVertexArray();
        this.modelMatrix = mat4.create();
    }
    bindAttribuites(program, gl, lineBuffer){
        gl.bindVertexArray(this.vao);
        let positionLocation = gl.getAttribLocation(program, `a_position`);
        if (positionLocation < 0) {
            console.log('Failed to get the storage location of a_position');
            return -1;
          }
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    };
    computeLine(){
        let auxMatrix = mat4.create();
        mat4.translate(auxMatrix, auxMatrix, this.initialPos);
        mat4.scale(this.modelMatrix, auxMatrix, this.finalPos);
    }
    setInitialPos(pos){
        this.initialPos[0] = pos[0];
        this.initialPos[1] = pos[1];
        this.initialPos[2] = pos[2];
    }
    setLenght(lenght){
        this.finalPos[0] = lenght;
        this.finalPos[1] = lenght;
        this.finalPos[2] = lenght;
    }
}
function initializeLine(gl, a, b){
    a.concat(b);
    var vertices = new Float32Array(a);
      var n = 2;
  
      var vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
  
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
      var aPosition = gl.getAttribLocation(program, 'a_position');
      if (aPosition < 0) {
        console.log('Failed to get the storage location of a_position');
        return -1;
      }
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPosition);
  
      return n;
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