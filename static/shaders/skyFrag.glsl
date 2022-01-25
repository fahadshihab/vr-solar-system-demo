uniform vec3 horizonColor;
uniform float scaleFactor;

varying vec3 rayDir;

void main() {
    gl_FragColor = vec4(horizonColor * exp(-rayDir.y * scaleFactor), 1.0);
}