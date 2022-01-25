export class CameraControls {

    isActive;
    
    mouseX;
    mouseY;
    pscreenX;
    pscreenY;

    constructor(scene, camera) {
        this.isActive = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.pscreenX = 0;
        this.pscreenY = 0;
        CameraControls.initializeCameraControls(this, camera);
    }

    static initializeCameraControls(self, camera) {
        window.addEventListener('mousemove', (event) => {
            self.rotateUsingMouse(camera, event);
        });  
        window.addEventListener('mousedown', () => {
            self.isActive = true;
        });
        window.addEventListener('mouseup', () => {
            self.isActive = false;
        });
        window.addEventListener('touchstart', (event) => {
            let touch = event.changedTouches[0];
            self.pscreenX = touch.screenX;
            self.pscreenY = touch.screenY;
        });
        window.addEventListener('touchmove', (event) => {
            self.rotateUsingTouch(camera, event);
        });
    }

    rotateUsingMouse(camera, event) {

        event.preventDefault();
        if(this.isActive === false) return;

        this.mouseX -= event.movementX / 100;
        this.mouseY -= event.movementY / 100;
        
        CameraControls.rotateCamera(camera, this.mouseY, this.mouseX);

    }

    rotateUsingTouch(camera, event) {

        let touch = event.changedTouches[0];

        this.mouseX -= (touch.screenX - this.pscreenX) / 100;
        this.mouseY -= (touch.screenY - this.pscreenY) / 100;

        CameraControls.rotateCamera(camera, this.mouseY, this.mouseX);

        this.pscreenX = touch.screenX;
        this.pscreenY = touch.screenY;

    }

    static rotateCamera(camera, angleX, angleY) {
        
        camera.rotation.x = 0;
        camera.rotation.y = 0;
        camera.rotation.z = 0;

        camera.rotateY(angleY);
        camera.rotateX(angleX);

    }
    
}