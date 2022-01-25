varying vec3 viewVertex;

void main() {
    vec4 viewVertexPosition = modelMatrix * vec4(position, 1.0);
    viewVertex = viewVertexPosition.xyz / viewVertexPosition.w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}