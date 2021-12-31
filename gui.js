import * as THREE from 'three';
import { Mesh } from 'three';
import { Text } from 'troika-three-text'

export class GUI extends Mesh{

    renderTexture;

    guiWidth;
    guiHeight;

    guiScene;
    guiCamera;

    constructor(
        guiWidth=1000,
        guiHeight=1000,
        planeWidth=1,
        planeHeight=1
    ) {
        super(new THREE.PlaneGeometry(planeWidth, planeHeight));

        this.guiWidth = guiWidth;
        this.guiHeight = guiHeight;

        this.renderTexture = new THREE.WebGLRenderTarget(guiWidth, guiHeight);

        this.guiScene = new THREE.Scene();
        
        this.guiCamera = new THREE.OrthographicCamera(
            -planeWidth/2, planeWidth/2,
            planeHeight/2, -planeHeight/2,
            0.01, 100
        );
        this.guiCamera.position.z = 5;

        this.material = new THREE.MeshBasicMaterial({map: this.renderTexture.texture, transparent: true});

        this.onBeforeRender = function (renderer, scene, camera) {
            this.renderTexture.texture.encoding = renderer.outputEncoding;

			this.visible = false;

			const currentRenderTarget = renderer.getRenderTarget();

			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			renderer.xr.enabled = false; 
			renderer.shadowMap.autoUpdate = false; 

			renderer.setRenderTarget( this.renderTexture );

			renderer.state.buffers.depth.setMask( true ); 

			if ( renderer.autoClear === false ) renderer.clear();
			renderer.render( this.guiScene, this.guiCamera );

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget( currentRenderTarget );
            const viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

			this.visible = true;
            
        }
    }

    add(mesh) {
        this.guiScene.add(mesh);
    }

    setLocation(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }
    
    sFunc(){
        const mutext = new Text();
        mutext.text = 'hello worldfasfsafaafa';
        mutext.fontSize = 0.1;
        mutext.color = 0x00FF00;
        this.guiScene.add(mutext);
        mutext.position.z = -2;
        mutext.sync();
    }
}
