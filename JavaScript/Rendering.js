import { Mat4 } from './math.js';
import { Parser } from './parser.js';
import { Scene } from './scene.js';
import { Renderer } from './renderer.js';
import { TriangleMesh } from './trianglemesh.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement createCube, createSphere, computeTransformation, and shaders
////////////////////////////////////////////////////////////////////////////////

// Example two triangle quad
const quad = {
  positions: [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, 1,  1, -1, -1,  1, -1],
  normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  uvCoords: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]
}

const unitCube = {
  positions: [
    -1,-1,1,/**/1,-1,1,/**/1,1,1, // Front Face triangles
    -1,-1,1,/**/1,1,1,/**/-1,1,1,

    1,-1,-1,/**/-1,-1,-1,/**/-1,1,-1, // Back Face triangles
    1,-1,-1,/**/-1,1,-1,/**/1,1,-1,

    -1,-1,-1,/**/-1,-1,1,/**/-1,1,1,  // Left Face triangles
    -1,-1,-1,/**/-1,1,1,/**/-1,1,-1,

    1,-1,1,/**/1,-1,-1,/**/1,1,-1,  // Right Face Triangles
    1,-1,1,/**/1,1,-1,/**/1,1,1,

    -1,1,1,/**/1,1,1,/**/1,1,-1,  // Top Face triangles
    -1,1,1,/**/1,1,-1,/**/-1,1,-1,

    -1,-1,-1,/**/1,-1,-1,/**/1,-1,1, // Bottom Face triangles
    -1,-1,-1,/**/1,-1,1,/**/-1,-1,1,

   ],
   normals: [
    0,0,1, 0,0,1, 0,0,1,/**/0,0,1, 0,0,1, 0,0,1, // Front Face

    0,0,-1, 0,0,-1, 0,0,-1,/**/0,0,-1, 0,0,-1, 0,0,-1, // Back Face

    -1,0,0, -1,0,0, -1,0,0,/**/-1,0,0, -1,0,0, -1,0,0,  // Left Face

    1,0,0, 1,0,0, 1,0,0,/**/1,0,0, 1,0,0, 1,0,0,  // Right Face

    0,1,0, 0,1,0, 0,1,0,/**/0,1,0, 0,1,0, 0,1,0, // Top Face

    0,-1,0, 0,-1,0, 0,-1,0,/**/0,-1,0, 0,-1,0, 0,-1,0, // Bottom Face
   ],
   uvCoords:[
    0,2.0/3.0, 0.5,2.0/3.0, 0.5,1,/**/0,2.0/3.0, 0.5,1, 0,1, // Front Face, 1

    0.5,0, 1,0, 1,1.0/3.0,/**/0.5,0, 1,1.0/3.0, 0.5,1.0/3.0,  // Back Face, 6

    0.5,1.0/3.0, 1,1.0/3.0, 1,2.0/3.0,/**/0.5,1.0/3.0, 1,2.0/3.0, 0.5,2.0/3.0,  // Left Face, 5

    0,1.0/3.0, 0.5,1.0/3.0, 0.5,2.0/3.0,/**/0,1.0/3.0, 0.5,2.0/3.0, 0,2.0/3.0, // Right Face, 2

    0,0, 0.5,0, 0.5,1.0/3.0,/**/0,0,0.5, 1.0/3.0, 0,1.0/3.0,  // Top Face, 3

    0.5,2.0/3.0, 1,2.0/3.0, 1,1,/**/0.5,2.0/3.0, 1,1, 0.5,1,  // Bottom Face, 4
   ]
}

TriangleMesh.prototype.createCube = function() {
  // TODO: populate unit cube vertex positions, normals, and uv coordinates
  this.positions = unitCube.positions;
  this.normals = unitCube.normals;
  this.uvCoords = unitCube.uvCoords;
}

/*
* Adapted from provided example at: https://www.songho.ca/opengl/gl_sphere.html
*/
TriangleMesh.prototype.createSphere = function(numStacks, numSectors) {
  // TODO: populate unit sphere vertex positions, normals, uv coordinates, and indices
  this.positions = [];
  this.normals = [];
  this.uvCoords = [];
  this.indices = [];

  const pi = Math.PI;
  const r = 1.0;
  const sectorStep = 2*pi/numSectors;
  const stackStep = pi/numStacks;

  for(let i=0; i<=numStacks; i++){
    const stackAngle = pi / 2 - i * stackStep;
    const xy = r*Math.cos(stackAngle);
    const z = r*Math.sin(stackAngle);

    for(let j=0; j<=numSectors; j++){
      const sectorAngle = j*sectorStep;
      const x = xy*Math.cos(sectorAngle);
      const y = xy*Math.sin(sectorAngle);

      this.positions.push(x,y,z);
      this.normals.push(x,y,z);

      const s = 1-j/numSectors;
      const t = i/numStacks;
      this.uvCoords.push(s,t);
    }
  }

  this.indices = this.computeSphereIndices(numStacks,numSectors);
}

/*
* Adapted from provided example at: https://www.songho.ca/opengl/gl_sphere.html
*/
TriangleMesh.prototype.computeSphereIndices = function(numStacks, numSectors) {
  const indices = [];

  for(let i=0; i<numStacks; i++){
    let k1 = i*(numSectors+1);
    let k2 = k1+numSectors+1;

    for(let j=0; j<numSectors; j++,k1++,k2++){
      if(i!=0){
        indices.push(k1,k2,k1+1);
      }
      if(i!=numStacks-1){
        indices.push(k1+1,k2,k2+1);
      }
    }
  }

  return indices;
}

Scene.prototype.computeTransformation = function(transformSequence) {
  // TODO: go through transform sequence and compose into overallTransform
  let overallTransform = Mat4.create();  // identity matrix
  for(let i=0; i<transformSequence.length; i++){
    const transformType = transformSequence[i][0];
    let transformMatrix = Mat4.create();
    if(transformType=='T'){
      const tx = transformSequence[i][1];
      const ty = transformSequence[i][2];
      const tz = transformSequence[i][3];
      this.createTranslationMatrix(transformMatrix,[tx,ty,tz]);
    }
    else if(transformType=='Rx'){
      this.createRotationMatrix(transformMatrix,0,transformSequence[i][1]);
    }
    else if(transformType=='Ry'){
      this.createRotationMatrix(transformMatrix,1,transformSequence[i][1]);
    }
    else if(transformType=='Rz'){
      this.createRotationMatrix(transformMatrix,2,transformSequence[i][1]);
    }
    else if(transformType=='S'){
      const sx = transformSequence[i][1];
      const sy = transformSequence[i][2];
      const sz = transformSequence[i][3];
      this.createScaleMatrix(transformMatrix,[sx,sy,sz]);
    }
    Mat4.multiply(overallTransform,transformMatrix,overallTransform);
  }
  return overallTransform;
}

Scene.prototype.createTranslationMatrix = function(matrix,[tx,ty,tz]) {
  Mat4.set(matrix, 
          1, 0, 0, 0, 
          0, 1, 0, 0, 
          0, 0, 1, 0, 
          tx,ty,tz,1);
}

Scene.prototype.createRotationMatrix = function(matrix,axis,degrees) {
  const radians = degrees*Math.PI/180;
  const cosT = Math.cos(radians);
  const sinT = Math.sin(radians);

  if(axis==0){
    Mat4.set(matrix,
      1, 0, 0, 0,
      0, cosT, sinT, 0,
      0, -sinT, cosT, 0,
      0, 0, 0, 1);
  }
  else if(axis==1){
    Mat4.set(matrix,
      cosT, 0, -sinT, 0,
      0, 1, 0, 0,
      sinT, 0, cosT, 0,
      0, 0, 0, 1);
  }
  else if(axis==2){
    Mat4.set(matrix,
      cosT, sinT, 0, 0,
     -sinT, cosT, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1);
  }
}

Scene.prototype.createScaleMatrix = function(matrix,[sx,sy,sz]) {
  Mat4.set(matrix,
    sx, 0, 0, 0,
     0, sy, 0, 0,
     0, 0, sz, 0,
     0, 0, 0, 1);
}

Renderer.prototype.VERTEX_SHADER = `
precision mediump float;

attribute vec3 position, normal;
attribute vec2 uvCoord;
uniform vec3 lightPosition;
uniform mat4 projectionMatrix, viewMatrix, modelMatrix;
uniform mat3 normalMatrix;
varying vec2 vTexCoord;

// TODO: implement vertex shader logic below

varying vec3 vNormal;
varying vec3 vLightDir;
varying vec3 vViewDir;
varying float vLightDist;

void main() {

  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 viewPos = viewMatrix * worldPos;
  vec4 viewLightPos = viewMatrix*vec4(lightPosition,1.0);

  vNormal = normalize(normalMatrix*normal);
  vLightDir = normalize(viewLightPos.xyz - viewPos.xyz);
  vLightDist = length(viewLightPos.xyz - viewPos.xyz);
  
  vViewDir = normalize(-viewPos.xyz);

  vTexCoord = uvCoord;
  gl_Position = projectionMatrix * viewPos;
}
`;

Renderer.prototype.FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 ka, kd, ks, lightIntensity;
uniform float shininess;
uniform sampler2D uTexture;
uniform bool hasTexture;

varying vec2 vTexCoord;

varying vec3 vNormal;
varying vec3 vLightDir;
varying vec3 vViewDir;
varying float vLightDist;

// TODO: implement fragment shader logic below

void main() {
  // Direction vectors
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vLightDir);
  vec3 V = normalize(vViewDir);
  vec3 H = normalize(L+V);

  // Ambient light
  vec3 ambient = ka*lightIntensity;
  
  // Diffuse light
  float d = vLightDist;
  vec3 diffuse = (kd/(d*d))*lightIntensity*max(dot(N,L),0.0);

  // Specular Light
  vec3 specular = (ks/(d*d))*lightIntensity*pow(max(dot(H,N),0.0),shininess);

  vec3 color = ambient+diffuse+specular;

  if(hasTexture){
    vec4 texColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = vec4(color * texColor.rgb, texColor.a);
  }
  else{
    gl_FragColor = vec4(color, 1.0);
  }
}
`;

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////

// Rainbow Worm
const DEF_INPUT = [
  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",

  "p,unitSphere,sphere,20,20;",

  "m,black,0.067, 0.071, 0.071,0.7,0.7,0.7,1,1,1,5;",

  "m,pink,0.361, 0.224, 0.341,0.7,0.7,0.7,1,1,1,5;",
  "m,lilac,0.298, 0.212, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,lavender,0.263, 0.212, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,periwinkle,0.239, 0.212, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,indigo,0.212, 0.212, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,blue,0.212, 0.235, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,cyan,0.212, 0.259, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,turquoise,0.212, 0.286, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,aqua,0.212, 0.314, 0.322,0.7,0.7,0.7,1,1,1,5;",
  "m,mint,0.212, 0.322, 0.29,0.7,0.7,0.7,1,1,1,5;",
  "m,sage,0.212, 0.322, 0.259,0.7,0.7,0.7,1,1,1,5;",

  // Body mats
  "o,g0,unitSphere,pink;",
  "o,g1,unitSphere,lilac;",
  "o,g2,unitSphere,lavender;",
  "o,g3,unitSphere,periwinkle;",
  "o,g4,unitSphere,indigo;",
  "o,g5,unitSphere,blue;",
  "o,g6,unitSphere,cyan;",
  "o,g7,unitSphere,turquoise;",
  "o,g8,unitSphere,aqua;",
  "o,g11,unitSphere,mint;",
  "o,g12,unitSphere,sage;",

  // Eye mats
  "o,g9,unitSphere,black;",
  "o,g10,unitSphere,black;",
  
  // Body transforms
  "X,g0,S,0.4,0.4,0.4;",
  "X,g0,T,3.5,3.5,3;",
  
  "X,g1,S,1.5,1.5,1.5;",
  "X,g1,T,0.7,1.5,0;",

  "X,g2,S,1.4,1.4,1.4;",
  "X,g2,T,-0.6,1,0;",

  "X,g3,S,1.3,1.3,1.3;",
  "X,g3,T,-1.8,0.2,0;",

  "X,g4,S,1.2,1.2,1.2;",
  "X,g4,T,-2.5,-1,0;",

  "X,g5,S,1.1,1.1,1.1;",
  "X,g5,T,-2.6,-1.9,0;",

  "X,g6,T,-2.3,-2.5,-0.4;",

  "X,g7,S,0.9,0.9,0.9;",
  "X,g7,T,-2,-3,-1;",

  "X,g8,S,0.8,0.8,0.8;",
  "X,g8,T,-1.8,-3.8,-1.5;",

  "X,g11,S,0.7,0.7,0.7;",
  "X,g11,T,-1.6,-4.5,-1.7;",
  
  "X,g12,S,0.6,0.6,0.6;",
  "X,g12,T,-1.9,-5.6,-1.9;",
  

  // Eye transforms
  "X,g9,S,0.2,0.2,0.2;",
  "X,g9,T,2,2.8,0.2;",
  "X,g10,S,0.2,0.2,0.2;",
  "X,g10,T,0.8,2.4,1.4;",

].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };

/*
 "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;",
  "o,gd,unitCube,grnDiceMat;",
  "o,bd,unitCube,bluDiceMat;",
  "o,gl,unitSphere,globeMat;",
  "X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
  "X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
  "X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
  "X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",


  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitSphere,sphere,20,20;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,gl,unitSphere,globeMat;",
  "X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",

  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitCube,cube;",
//"p,unitSphere,sphere,20,20;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
//"m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
//"m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
//"m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;",
//"o,gd,unitCube,grnDiceMat;",
//"o,bd,unitCube,bluDiceMat;",
//"o,gl,unitSphere,globeMat;",
"X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
//"X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
//"X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
//"X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",
  */