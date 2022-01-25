// old planet class

import * as THREE from 'three';
import atmosphereVertexShader from './static/shaders/atmosphereVert.glsl';
import atmosphereFragmentShader from './static/shaders/atmosphereFrag.glsl';

import gsap from 'gsap';

// sample usage

// const mars = new Planet(
//   {
//     radius: 1,
//     atmosphereHeight: 0.1,
//     textureFileName: '/static/img/2k_mars.jpg',
//     atmosphere: true,
//     sun: light,
//     K: new THREE.Vector3(0.3, 0.6, 0.04),
//     H0: 0.1,
//     sunStrength: 20
//   }
// );

const PlanetDefaults = {
    moveDuration: 0.8
};

export class Planet extends THREE.Mesh{

    texture;
    material;
    geometry;
    mesh;

    atmosphereGeometry;
    atmosphereMaterial
    atmosphereMesh;

    constructor(
        params
    ){
        super();

        this.geometry = new THREE.SphereGeometry(params.radius, 128, 64);
        this.texture = new THREE.TextureLoader().load(params.textureFileName);
        this.material = new THREE.MeshStandardMaterial({
            map: this.texture
        });
        //this.mesh = new THREE.Mesh(this.geometry, this.material);


        if(params.atmosphere === true){
            this.atmosphereGeometry = new THREE.SphereGeometry(
                params.radius + params.atmosphereHeight,
                128, 64
            );

            this.uniforms = {
                spherePosition: {
                    type: 'vec3',
                    value: new THREE.Vector3(0, 0, 0)
                },
                planetRadius: {
                    type: 'float',
                    value: params.radius
                },
                atmosphereHeight: {
                    type: 'float',
                    value: params.atmosphereHeight
                },
                sphereRadius2: {
                    type: 'float',
                    value: Math.pow(params.radius + params.atmosphereHeight, 2)
                },
                planetRadius2: {
                    type: 'float',
                    value: Math.pow(params.radius, 2)
                },
                sun: {
                    type: 'vec3',
                    value: new THREE.Vector3(0, 0, 0)
                },
                K: {
                    type: 'vec3',
                    value: params.K
                },
                H0: {
                    type: 'float',
                    value: params.H0
                },
                sunStrength: {
                    type: 'float',
                    value: params.sunStrength
                }
            }

            this.atmosphereMaterial = new THREE.ShaderMaterial({
                vertexShader: atmosphereVertexShader,
                fragmentShader: atmosphereFragmentShader,
                uniforms: this.uniforms,
                blending: THREE.AdditiveBlending,
                //side: THREE.DoubleSide,
                transparent: true
            });
            this.atmosphereMesh = new THREE.Mesh(
                this.atmosphereGeometry,
                this.atmosphereMaterial
            );

            this.onBeforeRender = function () {
                this.uniforms.spherePosition.value.copy(this.getWorldPosition(new THREE.Vector3(0, 0, 0)));
                this.uniforms.sun.value.copy(params.sun.getWorldPosition(new THREE.Vector3(0, 0, 0)));
            }
            
            this.add(this.atmosphereMesh);
        }

        
    }

    move(x, y, z, duration = PlanetDefaults.moveDuration) {
        gsap.to(
            this.position,
            {
                x: x,
                y: y,
                z: z,
                duration: duration
            }
        );
    }

}
