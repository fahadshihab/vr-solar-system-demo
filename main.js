import './style.css'
import * as THREE from 'three';
import { Planet } from './planet';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import {GUI} from './gui';
import { Group } from 'three';
import { Camera } from 'three';

import {Text} from 'troika-three-text';

let fov = 50;
let near_point = 0.1;
let far_point = 1000;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
  fov, 
  window.innerWidth / window.innerHeight, 
  near_point, 
  far_point );
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.appendChild( VRButton.createButton( renderer ) );

const cameraGroup = new Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

renderer.xr.enabled = true;

const left = renderer.xr.getController(0);
left.position.x = 10;

const mars = new Planet(
  scene,
  './static/img/2k_mars.jpg',
  1
);

const gui = new GUI(500, 500);

const mars2 = new Planet(
  gui.guiScene,
  './static/img/2k_mars.jpg',
  0.4
);

gui.sFunc();

const myText = new Text();
scene.add(myText)

// Set properties to configure:
myText.text = 'Hello world!'
myText.fontSize = 0.2
myText.position.z = -2
myText.color = 0x9966FF;


const light2 = new THREE.PointLight(0xFFFFFF, 1, 0);
light2.position.set(50, 50, 50);
gui.add(light2);


const light = new THREE.PointLight(0xFFFFFF, 1, 0);
light.position.set(50, 50, 50);
scene.add(light);

scene.add(gui);

cameraGroup.position.z = 5;
gui.position.x = 1;

renderer.setAnimationLoop((time) => {
	renderer.render( scene, camera );
});



window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

let isMousePressed = true;

window.addEventListener('mousedown', () => {
  isMousePressed = true;
});

window.addEventListener('mouseup', () => {
  isMousePressed = false;
});

window.addEventListener('mousemove', (event) => {
  if(isMousePressed === false) return;
  mars.mesh.position.x += event.movementX/100;
  mars.mesh.position.y -= event.movementY/100;
});

window.addEventListener('wheel', (event) => {
  mars.mesh.position.z += event.deltaY*0.01;
})