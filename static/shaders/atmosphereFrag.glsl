#define OUT_SCATTERING_STEPS 5
#define IN_SCATTERING_STEPS 5

#define FOUR_PI 12.566370614359172953850573533118

varying vec3 rayDir;
varying vec3 sphPosition;
varying vec3 viewSun;

uniform float planetRadius;
uniform float atmosphereHeight;
uniform float sphereRadius2;
uniform float planetRadius2;
uniform float sunStrength;

uniform vec3 K;
uniform float H0;

const vec3 viewOrigin = vec3(0.0, 0.0, 0.0);

vec2 getRaySphereIntersection(vec3 rayDir, vec3 rayOrigin, vec3 spherePosition, float sphereRadius2) {
    vec3 rayVector = rayOrigin - spherePosition;
    float b = -1.0 * dot(rayDir, rayVector);
    float det = (b * b) - (dot(rayVector, rayVector) - sphereRadius2);
    float Da, Db;
    if(det > 0.0) {
        Da = b - sqrt(det);
        Db = b + sqrt(det);
    } else {
        Da = Db = 0.0;
    }
    return vec2(Da, Db);
}

float getRayleighPhase(vec3 sunDir, vec3 rayDir) {
    float costheta = dot(sunDir, rayDir);
    return 0.75 * (1.0 + (costheta * costheta));
}

vec3 getPointOnRay(vec3 rayDir, vec3 rayOrigin, float d) {
    return rayOrigin + (d * rayDir);
}

float getAltitude(vec3 rayDir, vec3 rayOrigin, float d, vec3 spherePosition) {
    float radialDistance = distance(
        getPointOnRay(rayDir, rayOrigin, d),
        spherePosition
    );
    return (radialDistance - planetRadius) / atmosphereHeight;
}

vec3 calculateOpticalThickness(vec3 rayDir, vec3 rayOrigin, vec2 distances, vec3 spherePosition) {
    float integral = 0.0;
    float ds = (distances.y - distances.x) / float(OUT_SCATTERING_STEPS);
    for(int i = 0; i < OUT_SCATTERING_STEPS; ++i) {
        integral += exp(-getAltitude(rayDir, rayOrigin, distances.x + ((float(i) + 0.5) * ds), spherePosition) / H0) * ds;
    }
    vec3 thickness = FOUR_PI * integral * K;
    return thickness;
}

vec3 calculateInScattering(vec3 rayDir, vec3 rayOrigin, vec3 sun, vec2 distances, vec3 spherePosition, float rSphere, float rPlanet) {
    vec3 integral = vec3(0.0, 0.0, 0.0);
    float ds = (distances.y - distances.x) / float(IN_SCATTERING_STEPS);
    for(int i = 0; i < IN_SCATTERING_STEPS; ++i) {
        float curDistance = distances.x + ((float(i) + 0.5) * ds);
        float curAltitude = getAltitude(rayDir, rayOrigin, curDistance, spherePosition);
        vec3 P = getPointOnRay(rayDir, rayOrigin, curDistance);
        vec3 sunRayDir = normalize(sun - P);
        vec2 sunRayIntersections = getRaySphereIntersection(sunRayDir, P, spherePosition, rSphere);
        //vec2 sunRayPlanetIntersections = getRaySphereIntersection(sunRayDir, P, spherePosition, rPlanet);
        vec3 tPPc = calculateOpticalThickness(sunRayDir, P, vec2(0.0, sunRayIntersections.y), spherePosition);
        //if(sunRayIntersections.x > 0.0)
            //tPPc = vec3(0.0, 0.0, 0.0);
        //vec3 tPPc = calculateOpticalThickness(rayDir, rayOrigin, vec2(curDistance, distances.y), spherePosition);
        vec3 tPPa = calculateOpticalThickness(rayDir, rayOrigin, vec2(distances.x, curDistance), spherePosition);
        integral += exp(-curAltitude / H0) * exp(-tPPc - tPPa) * ds;
    }
    return getRayleighPhase(normalize(sun - spherePosition), rayDir) * (K * integral) * sunStrength;
}

void main() {

    vec2 atmosIsec = getRaySphereIntersection(rayDir, viewOrigin, sphPosition, sphereRadius2);
    vec2 planetIsec = getRaySphereIntersection(rayDir, viewOrigin, sphPosition, planetRadius2);
    
    if(planetIsec.x > 0.0) atmosIsec.y = planetIsec.x;

    //float thickness = calculateOpticalThickness(rayDir, viewOrigin, atmosIsec, sphPosition).x;
    vec3 intensity = calculateInScattering(rayDir, viewOrigin, viewSun, atmosIsec, sphPosition, sphereRadius2, planetRadius2);

    //float intensity = (1.0 - exp(atmosIsec.x - atmosIsec.y)) * 2.0;
    //gl_FragColor = vec4(atmosphereColor, 1.0) * intensity;
    gl_FragColor = vec4(intensity, 1.0);
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 0.4);
}