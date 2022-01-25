import * as THREE from 'three';
import gsap from 'gsap/all';

import { OBJLoader } from 'three/examples/jsm/loaders/objloader';

import introShaderVert from './static/shaders/introShaderVert.glsl';
import introShaderFrag from './static/shaders/introShaderFrag.glsl';

const introUniforms = {
    color: {
      type: 'vec3',
      value: new THREE.Vector3(0.325, 0.96, 0.506)
    },
    t: {
      type: 'float',
      value: 0.0
    },
    phaseFactor: {
      type: 'float',
      value: 30.0
    }
};

export class IntroSkyBox extends THREE.Mesh {
    constructor(radius, detail) {
        super();
        this.geometry = new THREE.IcosahedronGeometry(radius, detail);
        this.material = new THREE.ShaderMaterial({
            vertexShader: introShaderVert,
            fragmentShader: introShaderFrag,
            wireframe: true,
            uniforms: introUniforms,
            transparent: true
        });
        this.onBeforeRender = () => this.material.uniforms.t.value = introUniforms.t.value;

        this.material.depthWrite = false;

        this.points = new THREE.Points(
            this.geometry,
            new THREE.PointsMaterial({
                size: 0.5,
                transparent: true,
                opacity: 1,
                depthWrite: false
            })
        );
    }

    transition(duration = 3, onComplete = () => {}) {
        gsap.to(
            introUniforms.t,
            {
              value: 0.6,
              duration: duration
            }
        );
        gsap.to(
            this.points.material,
            {
                opacity: 0,
                duration: duration,
                onComplete: onComplete
            }
        )
    }

    destroy() {
        this.onBeforeRender = () => {};
        this.points = null;
        this.geometry.dispose();
        this.material.dispose();
    }
}

export class SkyBox extends THREE.Mesh {
    constructor() {
        super();
        this.geometry = new THREE.SphereGeometry(110, 32, 16, 0, Math.PI * 2, 0, Math.PI);
        this.material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});

        this.textureLoaded = false;
        
    }

    static loadTexture(self) {
        const loader = new THREE.TextureLoader();
        loader.load(
            self.textureUrl,
            (texture) => {
                self.textureLoaded = true;
                self.material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    map: texture,
                    opacity: 0,
                    side: THREE.BackSide
                });
            }
        );
    }

    transition() {
        gsap.to(
            this.material,
            {
                opacity: 1,
                duration: 2
            }
        );
    }
}

export class Stars extends THREE.Points {

    starPositions;
    stars;

    textureUrl;

    static opacity = 0;

    static textureUrls = [
        './static/img/star-1.png',
        './static/img/star-2.png',
        './static/img/star-3.png',
        './static/img/star-4.png',
        './static/img/star-5.png',
        './static/img/star-6.png',
    ];

    constructor(size = 0.3){

        let starPositions = [];

        for(let i = 0; i < 500; i++) {

            const x = THREE.MathUtils.randFloatSpread(200);
            const y = THREE.MathUtils.randFloatSpread(200)
            const z = THREE.MathUtils.randFloatSpread(200);

            if(Math.sqrt(x*x + y*y + z*z) > 60)
                starPositions.push(x, y, z);
            }

            const starGeometry = new THREE.BufferGeometry();
            starGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( starPositions, 3 ) );
            const starMaterial = new THREE.PointsMaterial({
                color: 0xFFFFFF, 
                size: 0.3,
                transparent: true
            });
            super(starGeometry, starMaterial);
            this.size = size;
            this.onBeforeRender = () => this.material.opacity = Stars.opacity;
    }

    static loadTexture(self) {
        const loader = new THREE.TextureLoader();
        loader.load(
            self.textureUrl,
            (texture) => {
                self.material = new THREE.PointsMaterial({
                    size: self.size,
                    map: texture,
                    transparent: true,
                    opacity: Stars.opacity
                });
            }
        );
    }

    static transition() {
        gsap.to(
            Stars,
            {
              opacity: 1,
              duration: 6
            }
        );
    }
}


const BaseConstants = {
    url: './static/models/balcony.obj',
    RingColor: 0xF0F0F0,
    RingOuterRadius: 0.5,
    RingInnerRadius: 0.4,
    RingSegments: 25,
    RingPhiSegments: 4
};

export class Base extends THREE.Mesh {

    loadFraction;

    constructor() {
        super(
            new THREE.RingGeometry(
                BaseConstants.RingInnerRadius,
                BaseConstants.RingOuterRadius,
                BaseConstants.RingSegments,
                BaseConstants.RingPhiSegments
            ),
            new THREE.MeshBasicMaterial({color: BaseConstants.RingColor})
        );
        Base.load(this);
    }

    static load(self) {
        const loader = new OBJLoader();
        loader.load(
            BaseConstants.url,
            (group) => {
                const pos = new THREE.Vector3();
                const rot = new THREE.Vector3();
                pos.copy(self.position);
                rot.copy(self.rotation);
                self.copy(group.children[0]);
                self.position.copy(pos);
                self.rotation.copy(rot);
                self.material = new THREE.MeshBasicMaterial({wireframe: true, color: 0x303030})
            },
            (xhr) => self.updateWhileLoading(xhr.loaded / xhr.total),
            (error) => console.error(error)
        );
    }

    updateWhileLoading(loadFraction) {
        this.geometry = new THREE.RingGeometry(
            BaseConstants.RingInnerRadius,
            BaseConstants.RingOuterRadius,
            BaseConstants.RingSegments,
            BaseConstants.RingPhiSegments, 
            0, 
            loadFraction * Math.PI * 2
        );
        console.log(loadFraction * 100 + '%');
    }
}