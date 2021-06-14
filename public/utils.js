class Scene {
    constructor(gl){
        this._gl = gl;
        this._program = program;
        this._camera = new Camera(75, gl.canvas.width/gl.canvas.height, 1e-4, 10000);
        this._viewProjectionMatrix;
        this._mvpMatrix;
        this._objectsToDrawn = [];
        this._linesToDrawn = [];
        this._texture;
        this._cubeData;
        this._lineData;
        this._texture;
        this._textcoordData;
        this._uniformLocation;

        this.useTextures = true;
        this.useWireFrame = false;

        this._grassBlock = [3,0, 3,0, 3,0, 3,0, 2,9, 2,0];
        this._TNTBlock = [8,0, 8,0, 8,0, 8,0, 9,0, 10,0];
        this._sandBlock = [2,1, 2,1, 2,1, 2,1, 2,1, 2,1, 2,1]

        this._Init();
    }
    _Init(){
        let vertexShader = compileShader(this._gl, vertexShaderSource, this._gl.VERTEX_SHADER);
        let fragmentShader = compileShader(this._gl, fragmentShaderSource, this._gl.FRAGMENT_SHADER);
        this._program = createProgram(this._gl, vertexShader, fragmentShader);
        this._cubeData = [
        
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
        this._lineData = [0,0,0,1,1,1];
        this._textcoordData = repeat(6, [
            0, 0, // top left
            1, 0, // top right
            1, 1, // bottom right
        
            0, 0, // top left
            1, 1, // bottom right
            0, 1  // bottom left
        ]);
        this._uniformLocation = {
            mvpMatrix: gl.getUniformLocation(program, `u_mvpMatrix`),
            useTextures: gl.getUniformLocation(program, `u_useTextures`),
            face: gl.getUniformLocation(program, `u_face`),
        };
    }
    AddObject(object){
        this._objectsToDrawn.push(object);
    }
    Draw(){

        this._gl.useProgram(this._program);
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.enable(this._gl.DEPTH_TEST);

        this._camera.ComputeView();
        mat4.multiply(this._viewProjectionMatrix, this._camera.projectionMatrix, this._camera.viewMatrix);

        this._objectsToDrawn.forEach(function(object) {
            this._gl.bindVertexArray(object.vao);
            object.matrixMultiply();
            mat4.multiply(this._mvpMatrix, this._viewProjectionMatrix, object.modelMatrix);
            this._gl.uniformMatrix4fv(this._uniformLocation.mvpMatrix, false, this._mvpMatrix);
            this._gl.uniform2fv(this._uniformLocation.face, object.GetBlockType());
            this._gl.uniform1i(this._uniformLocation.useTextures, this.useTextures);

            if(this.useWireFrame){
                this._gl.drawArrays(this._gl.LINE_STRIP, 0, this._cubeData.lenght/4);
            }
            else{
                this._gl.drawArrays(this._gl.TRIANGLES, 0, this._cubeData.lenght/4);
            }
        })

        this._linesToDrawn.forEach(function(line) {
            this._gl.bindVertexArray(line.vao);
            line.computeLine();
            mat4.multiply(this._mvpMatrix, this._viewProjectionMatrix, line.modelMatrix);
            this._gl.uniformMatrix4fv(this._uniformLocation.mvpMatrix, false, this._mvpMatrix);
            this._gl.uniform1i(this._uniformLocation.useTextures, this.useTextures);
            this._gl.drawArrays(this._gl.LINES, 0, this._lineData.lenght/3);

        })

    }
}

class Camera {
    constructor(fieldOfView, aspectRatio, near, far){
        this.up = [0, 1, 0];
        this.cameraMatrix;
        this.viewMatrix = mat4.create();
        this.viewProjectionMatrix = mat4.create();
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

    SetPosition(x, y, z){
        this.viewX = x;
        this.viewY = y;
        this.viewZ = z;
    }

    ComputeView(){
        this.cameraMatrix = mat4.create();
        mat4.translate(this.cameraMatrix, this.cameraMatrix, [this.viewX, this.viewY, this.viewZ]);
        mat4.rotateY(this.cameraMatrix, this.cameraMatrix, degToRad(this.rotationY));
        mat4.rotateX(this.cameraMatrix, this.cameraMatrix, degToRad(this.rotationX));        
        mat4.invert(this.viewMatrix, this.cameraMatrix);
    }
    ComputeViewProjection(){
        mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }
    Position(){
        let auxMatrix = mat4.create();
        mat4.copy(auxMatrix, this.viewMatrix);
        mat4.invert(auxMatrix, auxMatrix);
        return [auxMatrix[12],auxMatrix[13],auxMatrix[14]];
    }

    Normal(lenght=1){
        let normal = vec4.create();
        normal[2] = lenght;
        vec4.transformMat4(normal, normal, this.cameraMatrix);
        normal[0] *= -1;
        normal[1] *= -1;
        normal[2] *= -1;
        return normal;
    }

    NormalSide(){
        let normal = vec4.create();
        normal[0] = 1;
        vec4.transformMat4(normal, normal, this.cameraMatrix);
        normal[0] *= -1;
        normal[1] *= -1;
        normal[2] *= -1;
        return normal;
    }

    translationW(velocity=0.2){
        let normal = this.Normal();
        this.viewX += (normal[0] * velocity);
        this.viewY += (normal[1] * velocity);
        this.viewZ += (normal[2] * velocity);
    }
    translationS(velocity=0.2){
        let normal = this.Normal();
        this.viewX -= (normal[0] * velocity);
        this.viewY -= (normal[1] * velocity);
        this.viewZ -= (normal[2] * velocity);
    }
    translationD(velocity=0.2){
        let normal = this.NormalSide();
        this.viewX -= (normal[0] * velocity);
        this.viewY -= (normal[1] * velocity);
        this.viewZ -= (normal[2] * velocity);
    }
    translationA(velocity=0.2){
        let normal = this.NormalSide();
        this.viewX += (normal[0] * velocity);
        this.viewY += (normal[1] * velocity);
        this.viewZ += (normal[2] * velocity);
    }
    translationQ(velocity=0.2){
        let normal = vec3.fromValues(0,1,0);
        this.viewY -= (normal[1] * velocity);
    }
    translationE(velocity=0.2){
        let normal = vec3.fromValues(0,1,0);
        this.viewY += (normal[1] * velocity);
    }
}

class Object {
    constructor(){
        this.translationX = 0;
        this.translationY = 0;
        this.translationZ = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleZ = 1;
        this.modelMatrix = mat4.create();
        this._blockType;
        this.matrixMultiply();
    };

    matrixMultiply() {
        let auxMatrix = mat4.create();
        mat4.translate(auxMatrix, auxMatrix, [this.translationX,this.translationY,this.translationZ]);
        mat4.rotateX(auxMatrix, auxMatrix, degToRad(this.rotationX));
        mat4.rotateY(auxMatrix, auxMatrix, degToRad(this.rotationY));
        mat4.rotateZ(auxMatrix, auxMatrix, degToRad(this.rotationZ));
        mat4.scale(this.modelMatrix, auxMatrix, [this.scaleX,this.scaleY,this.scaleZ]);
    };

    SetPosition(x, y, z){
        this.translationX = x;
        this.translationY = y;
        this.translationZ = z;
    }

    GetPosition(){
        return [this.modelMatrix[12],this.modelMatrix[13],this.modelMatrix[14]];
    }

    SetBlockType(blockType){
        this._blockType = blockType;
    }
    GetBlockType(){
        return this._blockType;
    }
}

class Player {
    constructor(){

    }
}
class Line {
    constructor(initialPos, finalPos){
        this.initialPos = initialPos;
        this.finalPos = finalPos;
        this.modelMatrix = mat4.create();
        linesToDrawn.push(this);
        this.computeLine();
    }
    computeLine(){
        let auxMatrix = mat4.create();
        let finalPos = vec3.fromValues((this.finalPos[0]-this.initialPos[0]),(this.finalPos[1]-this.initialPos[1]),(this.finalPos[2]-this.initialPos[2]));
        mat4.translate(auxMatrix, auxMatrix, this.initialPos);
        mat4.scale(this.modelMatrix, auxMatrix, finalPos);
    }
    Lenght(){
        return Math.sqrt((this.finalPos[0]-this.initialPos[0])**2+(this.finalPos[1]-this.initialPos[1])**2+(this.finalPos[2]-this.initialPos[2])**2)
    }
}

function distancia(a, b){
    return Math.sqrt((b[0]-a[0])**2 + (b[1]-a[1])**2 + (b[2]-a[2])**2);
}

// function equacaoDaReta(p1, p2){
//     let a = p1[1] - p2[1];
//     let b = p2[0] - p1[0];
//     let c = p1[0]*p2[1] - p2[0]*p1[1];
//     return [a, b, c];
// }

// function distanciaPontoReta(eq, p0){
//     // [a, b, c];
//     let dividendo = Math.abs(eq[0]*p0[0] + eq[1]*p0[1] + eq[2]);
//     let divisor = Math.sqrt(Math.pow(eq[0], 2) + Math.pow(eq[1], 2));
//     let d = dividendo / divisor;
//     return d;
// }

function formatedFloat(x) {
    return Number.parseFloat(x).toFixed(2);
}
function repeat(n, pattern){
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
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
        throw ("program failed to link:" + gl.getProgramInfoLog (program));
    }
    return program;
};

const vertexShaderSource = 
`#version 300 es

uniform mat4 u_mvpMatrix;
uniform vec2[6] u_face;

in vec4 a_position;
in vec2 a_textcoord;
in vec3 a_color;

out vec3 v_color;
out vec2 v_textcoord;

const float size = 1.0/16.0;

void main() {
    int f = int(a_position.w);
    gl_Position = u_mvpMatrix * vec4(a_position.x, a_position.y, a_position.z, 1);

    float u = (u_face[f].x + a_textcoord.x) * size;
    float v = (u_face[f].y + a_textcoord.y) * size;

    v_textcoord = vec2(u,v);
    v_color = a_color;
}
`;
const fragmentShaderSource = 
`#version 300 es
precision highp float;

uniform int u_useTextures;
uniform sampler2D u_texture;

in vec3 v_color;
in vec2 v_textcoord;

out vec4 outColor;

void main() {
    if(u_useTextures == 0){
        outColor = vec4(v_color, 1.0);
    }
    else {
        outColor = texture(u_texture, v_textcoord);
    }
}
`;