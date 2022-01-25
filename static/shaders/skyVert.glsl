varying vec3 rayDir;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    rayDir = normalize(worldPos.xyz / worldPos.w);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}