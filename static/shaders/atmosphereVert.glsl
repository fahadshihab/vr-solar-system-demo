uniform vec3 spherePosition;
uniform vec3 sun;

varying vec3 rayDir; 
varying vec3 sphPosition;
varying vec3 viewSun;

void main() {
    vec4 viewVertexPosition = modelViewMatrix * vec4(position, 1.0);
    rayDir = normalize(viewVertexPosition.xyz / viewVertexPosition.w);
    vec4 viewSpherePosition = viewMatrix * vec4(spherePosition, 1.0);
    sphPosition = viewSpherePosition.xyz / viewSpherePosition.w;
    vec4 viewSunPosition = viewMatrix * vec4(sun, 1.0);
    viewSun = viewSunPosition.xyz / viewSunPosition.w;
    gl_Position = projectionMatrix * viewVertexPosition;
}