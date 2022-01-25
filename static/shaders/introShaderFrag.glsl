varying vec3 viewVertex;
uniform vec3 color;
uniform float t;
uniform float phaseFactor;

void main() {
    //float luminosity = 0.5 + (0.5 * sin(viewVertex.y * t));
    float luminosity = sin((viewVertex.y * t) + (phaseFactor * t * t));
    gl_FragColor = vec4(luminosity * color, luminosity * exp(-10.0*t));
}