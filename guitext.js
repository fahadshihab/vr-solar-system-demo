import {Text} from 'troika-three-text';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Shapes } from './shapes';

export const GUIFontSize = {
    Heading: 0.5,
    SubHeading: 0.3,
    Normal: 0.1
};

const GUIFont = {
    Roboto: 'https://fonts.gstatic.com/s/quicksand/v7/6xKtdSZaM9iE8KbpRA_hK1QL.woff'
};

const GUIDefaults = {
    text: 'Hello World',
    fontSize: 0.2,
    color: 0xFFFFFF,
    align: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: GUIFont.Roboto,
    defaultColor: 0xFFFFFF,
    selectionColor: 0x00FF00,
    buttonOpacity: 1,
    fadeDuration: 1,
    moveDuration: 0.8,
    isEnabled: false
};

export class GUIText extends Text {

    /**
     * 
     * @param {Object}  params 
     * @param {string}  params.text
     * @param {Number}  params.fontSize
     * @param {Hex}     params.color
     * @param {string}  params.align
     * @param {string}  params.anchorX
     * @param {string}  params.anchorY
     * @param {string}  params.font
     * @param {Number}  params.maxWidth
     */
    constructor(params) {
        super();
        this.text = params.text === undefined ? GUIDefaults.text : params.text;
        this.fontSize = params.fontSize === undefined ? GUIDefaults.fontSize : params.fontSize;
        this.color = params.color === undefined ? GUIDefaults.color : params.color;
        this.textAlign = params.align === undefined ? GUIDefaults.align : params.align;
        this.anchorX = params.anchorX === undefined ? GUIDefaults.anchorX : params.anchorX;
        this.anchorY = params.anchorY === undefined ? GUIDefaults.anchorY : params.anchorY;
        this.font = params.font === undefined ? GUIDefaults.font : params.font;
        if(params.maxWidth !== undefined) this.maxWidth = params.maxWidth;
        this.material.opacity = 0;
        this.addEventListener('synccomplete', this.onFirstLoad);
    }

    onFirstLoad() {
        this.fadeIn();
        this.removeEventListener('synccomplete', this.onFirstLoad);
    }

    setPosition(x, y) {
        this.position.x = x
        this.position.y = y
    }

    fadeOut(duration = GUIDefaults.fadeDuration, onComplete = () => {}) {
        gsap.to(
            this.material,
            {
                opacity: 0,
                duration: duration,
                onComplete: onComplete
            }
        );
    }

    fadeIn(duration = GUIDefaults.fadeDuration, onComplete = () => {}) {
        gsap.to(
            this.material,
            {
                opacity: 1,
                duration: duration,
                onComplete: onComplete
            }
        );
    }

    move(x, y, z = 0, duration = GUIDefaults.moveDuration, onComplete = () => {}) {
        gsap.to(
            this.position,
            {
                x: x,
                y: y,
                z: z,
                duration: duration,
                onComplete: onComplete
            }
        );
    }

    
}

export class GUIButton extends GUIText {

    buttonMesh;
    defaultColor;
    selectionColor;

    isHit;
    isEnabled;
    timeSinceLastHit;
    dispatcher;

    static guiClickDelay = 1000;
    static inXRMode = false;
    static raycaster;

    /**
     * 
     * @param {Object}  params
     * @param {Boolean} params.isEnabled
     * @param {string}  params.text
     * @param {Number}  params.fontSize
     * @param {Hex}     params.color
     * @param {string}  params.align
     * @param {string}  params.anchorX
     * @param {string}  params.anchorY
     * @param {Hex}     params.defaultColor
     * @param {Hex}     params.selectionColor
     */
    constructor(params){
        super(params);
        this.isHit = false;
        this.defaultColor = params.defaultColor === undefined ? GUIDefaults.defaultColor : params.defaultColor;
        this.selectionColor = params.selectionColor === undefined ? GUIDefaults.selectionColor : params.selectionColor;
        this.isEnabled = params.isEnabled === undefined ? GUIButton.isEnabled : params.isEnabled;
    }

    onFirstLoad() {

        const bounds = new THREE.Vector3(0, 0, 0);
        this.geometry.boundingBox.getSize(bounds);

        this.buttonMesh = this.setButtonMesh(bounds);
        this.buttonMesh.translateZ(0.01);
        this.add(this.buttonMesh);

        this.raycastMesh = this.setRaycastMesh(bounds);
        this.raycastMesh.visible = false;
        this.add(this.raycastMesh);

        this.update = GUIButton.inXRMode ? this.#updateInXRMode : this.#updateInNormalMode;

        this.removeEventListener('synccomplete', this.onFirstLoad);
        
        this.fadeIn();

        GUIButton.setOnBeforeRender(this);
        GUIButton.setEventListeners(this);

    }

    setButtonMesh(bounds) {
        return new THREE.Line(
            Shapes.roundedRectangle(0.1, bounds.x + 0.2, bounds.y + 0.2, 0, 0),
            new THREE.LineBasicMaterial({
                color: this.defaultColor,
                transparent: true,
                opacity: 0,
            })
        );
    }

    setRaycastMesh(bounds) {
        return new THREE.Mesh(
            new THREE.PlaneGeometry(bounds.x + 0.2, bounds.y + 0.2),
            new THREE.MeshBasicMaterial()
        );
    }

    static setOnBeforeRender(self) {
        self.buttonMesh.onBeforeRender = () => {
            self.update(GUIButton.raycaster);
        }
    }

    static setEventListeners(self) {
        window.addEventListener('click', (event) => {
            if(event.pointerType === 'touch') self.update(GUIButton.raycaster);
            if(self.isHit === true && self.isEnabled === true) self.onClicked();
        });
    }

    update(raycaster = new THREE.Raycaster){
        ;
    }

    #updateInXRMode(raycaster = new THREE.Raycaster) {

        this.update = GUIButton.inXRMode ? this.#updateInXRMode : this.#updateInNormalMode;

        let intersects = raycaster.intersectObject(this.raycastMesh);
        if(intersects.length === 0) {
            this.isHit = false;
            this.buttonMesh.material.color.set(this.defaultColor);
            return;
        }

        if(this.isHit === true && this.isEnabled === true) {
            this.buttonMesh.material.color.lerpColors(
                new THREE.Color(this.defaultColor), 
                new THREE.Color(this.selectionColor), 
                (performance.now() - this.timeSinceLastHit) / GUIButton.guiClickDelay
            );
            if(performance.now() - this.timeSinceLastHit > GUIButton.guiClickDelay) {
                this.isHit = false;
                this.onClicked();
            }
        } else {
            this.isHit = true;
            this.timeSinceLastHit = performance.now();
        }
    }

    #updateInNormalMode(raycaster = new THREE.Raycaster) {

        this.update = GUIButton.inXRMode ? this.#updateInXRMode : this.#updateInNormalMode;

        let intersects = raycaster.intersectObject(this.raycastMesh);
        if(intersects.length > 0) {
            this.buttonMesh.material.color.set(this.selectionColor);
            this.isHit = true;
        } else {
            this.buttonMesh.material.color.set(this.defaultColor);
            this.isHit = false;
        }

    }

    fadeOut(duration = GUIDefaults.fadeDuration, onComplete = () => {}) {
        super.fadeOut(duration);
        gsap.to(
            this.buttonMesh.material,
            {
                opacity: 0,
                duration: duration,
                onComplete: onComplete
            }
        );
    }

    fadeIn(duration = GUIDefaults.fadeDuration, onComplete = () => {}) {
        super.fadeIn(duration);
        gsap.to(
            this.buttonMesh.material,
            {
                opacity: GUIDefaults.buttonOpacity,
                duration: duration,
                onComplete: onComplete
            }
        );
    }

    destroy(){
        this.update = () => {};
        this.buttonMesh = null;
        this.raycastMesh = null;
        this.dispose();
    }

}