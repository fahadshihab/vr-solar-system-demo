import * as THREE from 'three';
export class Planet{

    #texture;
    #material;
    #geometry;
    mesh;

    constructor(
        scene,
        textureFileName,
        radius=1
    ){
        this.#geometry = new THREE.SphereGeometry(radius, 64, 32);
        this.#texture = new THREE.TextureLoader().load(textureFileName);
        this.#material = new THREE.MeshStandardMaterial({
            map: this.#texture
        });
        this.mesh = new THREE.Mesh(this.#geometry, this.#material);
        scene.add(this.mesh);
    }
}
