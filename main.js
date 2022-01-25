import './style.css'
import * as THREE from 'three';
import * as P2 from './planet2';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';

import {GUIText, GUIFontSize, GUIButton} from './guitext';
import {IntroSkyBox, SkyBox, Stars} from './environment';
import gsap from 'gsap/all';
import { CameraControls } from './controls';

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

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

GUIButton.raycaster = new THREE.Raycaster();

const gazeAim = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -100)]),
  new THREE.LineBasicMaterial({color: 0xFFFFFF})
);

renderer.xr.enabled = true;

//controller

const controller = renderer.xr.getController(0);
controller.addEventListener('selectstart', () => controller.isSelected = true);
controller.addEventListener('selectend', () => controller.isSelected = false);
controller.addEventListener('connected', (data) => controller.add(gazeAim));

scene.add(controller);

const clock = new THREE.Clock(true);
const cameracontrol = new CameraControls(scene, camera);

//background render

const bgscene = new THREE.Scene();
bgscene.add(cameraGroup);

const introSky = new IntroSkyBox(100, 10);
bgscene.add(introSky);
bgscene.add(introSky.points);

const skybg = new SkyBox();
skybg.textureUrl = './static/img/skyback101.png';
SkyBox.loadTexture(skybg);
bgscene.add(skybg);

const stars = [];
for(let i = 0; i < Stars.textureUrls.length; i++){
  stars.push(new Stars(1.2));
  stars[i].textureUrl = Stars.textureUrls[i];
  Stars.loadTexture(stars[i]);
  bgscene.add(stars[i]);
}

//fake screen for referencing
const refScreen = new THREE.Group();
sceneGroup.add(refScreen);
refScreen.position.z = -5;

// start level
levelOne();

// render loop

renderer.setAnimationLoop((time) => {
  
  if(renderer.xr.isPresenting) {
    sceneGroup.position.y = 1.6;
    gsap.ticker.tick(clock.getDelta());
    GUIButton.raycaster.set(controller.position, new THREE.Vector3(0, 0, -1).applyQuaternion(controller.quaternion));
    GUIButton.inXRMode = true;
  } else {
    sceneGroup.position.y = 0;
  }

  //startButton.update(raycaster);

  renderer.render(bgscene, camera);
  renderer.autoClear = false;
	renderer.render( scene, camera );
  renderer.autoClear = true;

});

//event listeners

window.addEventListener('resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();

});

//mouse event listeners

window.addEventListener('mousemove', (event) => {

  GUIButton.raycaster.setFromCamera({

    x: (2 * event.clientX / window.innerWidth) - 1,
    y: -(2 * event.clientY / window.innerHeight) + 1

  }, camera);

});

function levelOne() {

  //title

  let title = new GUIText({
    text: 'The Solar System \n in VR',
    fontSize: GUIFontSize.Heading
  });
  refScreen.add(title);
  title.setPosition(0, 0.5);
  title.sync();
  
  //startbutton
  
  let startButton = new GUIButton({
    text: 'Begin',
    fontSize: GUIFontSize.SubHeading,
    selectionColor: 0x0000FF,
    isEnabled: true
  });
  refScreen.add(startButton);
  startButton.setPosition(0, -0.5);
  startButton.sync();

  startButton.onClicked = () => {

    startButton.onClicked = () => {};

    introSky.transition(3, () => {
      bgscene.remove(introSky);
      introSky.destroy();
    });

    skybg.transition();

    Stars.transition();
    title.fadeOut(1, () => {
      refScreen.remove(title);
      title.dispose();
    });

    startButton.fadeOut(2, () => {
      refScreen.remove(startButton)
      startButton.destroy();
      levelTwo();
    });

  };

}

function levelTwo() {

  let lookUp = new GUIText({
    text: 'Look Up!',
    fontSize: GUIFontSize.Heading
  });
  lookUp.setPosition(0, 0.4);
  refScreen.add(lookUp);
  lookUp.sync();

  let helpDesktop = new GUIText({
    text: 
`Drag your mouse while holding the 
left mouse button to see around. 
      
In VR, move your head! Stare at
a button for 5 seconds to select it.`,
    fontSize: GUIFontSize.Normal,
  });
  helpDesktop.setPosition(0, -0.4);
  refScreen.add(helpDesktop);
  helpDesktop.sync();

  const dispScreen = new THREE.Group();
  scene.add(dispScreen);
  dispScreen.position.y = 8;
  dispScreen.position.z = -8;
  dispScreen.rotation.x = Math.PI / 4;

  const sun = new THREE.PointLight();
  sun.position.z = 10;
  refScreen.add(sun);

  const carousel = new P2.PlanetCarousel();
  dispScreen.add(carousel.displayScreen);

}