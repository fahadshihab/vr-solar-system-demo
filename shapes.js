import * as THREE from 'three';

export class Shapes {
    static roundedRectangle(r, l, w, x = 0, y = 0) {
        const path = new THREE.Path();
        path.moveTo((l/2) - r, w/2);
        path.lineTo((-l/2) + r, w/2);
        path.arc(0, -r, r, Math.PI/2, Math.PI);
        path.lineTo(-l/2, (-w/2) + r);
        path.arc(r, 0, r, Math.PI, 3/2 * Math.PI);
        path.lineTo((l/2) - r, -w/2);
        path.arc(0, r, r, 3/2 * Math.PI, 0);
        path.lineTo(l/2, (w/2) - r);
        path.arc(-r, 0, r, 0, Math.PI/2);
        path.closePath();

        const points = path.getPoints();

        return new THREE.BufferGeometry().setFromPoints(points);
    }
}