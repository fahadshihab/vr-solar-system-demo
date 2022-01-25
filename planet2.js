// new planet class

import gsap from 'gsap/all';
import * as THREE from 'three';
import { degToRad } from 'three/src/math/mathutils';
import {GUIButton, GUIFontSize, GUIText} from './guitext';

export class Planet extends THREE.Mesh {

    /**
     * 
     * @param {Object}  params
     * @param {Number}  params.radius
     * @param {Number}  params.detail
     * @param {string}  params.textureFileName
     * @param {Object}  params.atmosphere
     * @param {Number}  params.atmosphere.atmosphereHeight
     * @param {Number}  params.atmosphere.atmosphereOpacity
     * @param {Color}   params.atmosphere.atmosphereColor
     * @param {Object}  params.rings
     * @param {string}  params.rings.textureFileName
     * @param {Number}  params.rings.innerRadius
     * @param {Number}  params.rings.outerRadius
     * @param {Number}  params.rings.detail
     * @param {Number}  params.rings.opacity
     */
    constructor(params) {

        super();
        this.radius = params.radius;
        this.geometry = new THREE.IcosahedronGeometry(
            params.radius, 
            params.detail === undefined ? 6 : params.detail
        );
        this.material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0,
        });
        this.visible = false;

        if(params.textureFileName !== undefined) {
            Planet.load(
                this, params.textureFileName, 
                () => {
                    this.visible = true;
                    this.material.opacity = 0;
                    this.fadeIn();
                    if(params.atmosphere !== undefined)
                        this.loadAtmosphere(params.atmosphere);
                    if(params.rings !== undefined)
                        this.loadRings(params.rings);
                },
                params.specularFileName
            );
        }
    }

    /**
     * 
     * @param {Planet}      self             The object to store texture
     * @param {string}      textureFileName  path to texture
     * @param {function}    onComplete       calls this function when loading is complete
     * @param {string}      specularFileName path to specular texture
     */
    static load(self, textureFileName, onComplete = () => {}, specularFileName) {
        const loader = new THREE.TextureLoader();
        loader.load(
            textureFileName,
            (texture) => {
                self.material.map = texture;
                if(specularFileName !== undefined) return;
                onComplete(texture);
            },
            () => {},
            (error) => {console.error(error)}
        );

        if(specularFileName === undefined) return;
        
        loader.load(
            specularFileName,
            (texture) => {
                self.material.roughnessMap = texture;
                onComplete(texture);
            }
        )
    }

    /**
     * 
     * @param {Object} params
     * @param {Number} params.atmosphereHeight
     * @param {Number} params.atmosphereOpacity
     * @param {Color}  params.atmosphereColor
     */
    loadAtmosphere(params) {
        this.atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                this.radius + params.atmosphereHeight,
                16, 32
            ),
            new THREE.MeshStandardMaterial({
                color: params.atmosphereColor,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending
            })
        );
        this.add(this.atmosphere);
        gsap.to(
            this.atmosphere.material,
            {
                opacity: params.atmosphereOpacity,
                duration: 1,
            }
        );
    }
    
    /**
     * 
     * @param {Object}  params
     * @param {string}  params.textureFileName
     * @param {Number}  params.innerRadius
     * @param {Number}  params.outerRadius
     * @param {Number}  params.detail           integer. default 15.
     * @param {Number}  params.opacity          in range [0, 1]
     * @param {Number}  params.angleX           in radians. default 0
     * @param {Number}  params.angleY           in radians. default 0
     * @param {Number}  params.angleZ           in radians. default 0
     */
    loadRings(params) {
        this.rings = new THREE.Mesh(
            new THREE.RingGeometry(
                params.innerRadius,
                params.outerRadius,
                params.detail === undefined ? 15 : params.detail
            ),
            new THREE.MeshStandardMaterial({
                transparent: true,
                opacity: 0
            })
        );
        let pos = this.rings.geometry.attributes.position;
        let v3 = new THREE.Vector3();
        let avgRadius = (params.innerRadius + params.outerRadius) / 2
        for(let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            this.rings.geometry.attributes.uv.setXY(
                i, 
                v3.length() < avgRadius ? 0 : 1, 
                1
            );
        }
        this.rings.visible = false;

        if(params.angleX !== undefined) this.rings.rotation.x = params.angleX;
        if(params.angleY !== undefined) this.rings.rotation.y = params.angleY;
        if(params.angleZ !== undefined) this.rings.rotation.y = params.angleZ;

        this.add(this.rings);

        Planet.load(
            this.rings, 
            params.textureFileName,
            () => {
                this.rings.visible = true;
                gsap.to(
                    this.rings.material,
                    {
                        opacity: params.opacity === undefined ? 1 : params.opacity,
                        duration: 1
                    }
                );
            }
        );
    }

    fadeIn(duration = 1, onComplete = () => {}) {
        gsap.to(
            this.material,
            {
                opacity: 1,
                duration: duration,
                onComplete: onComplete
            }
        );
    }

    fade(duration = 1, opacity = 0, onComplete = () => {}) {
        gsap.to(
            this.material,
            {
                opacity: opacity,
                duration: duration
            }
        );

        if(this.atmosphere === undefined) return;

        gsap.to(
            this.atmosphere.material,
            {
                opacity: opacity,
                duration: duration
            }
        );

        if(this.rings === undefined) return;

        gsap.to(
            this.rings.material, 
            {
                opacity: opacity,
                duration: duration,
                onComplete: onComplete
            }
        );

    }

    /**
     * 
     * @param {Number}   x          adjusts local position.x
     * @param {Number}   y          adjusts local position.y
     * @param {Number}   z          adjusts local position.z
     * @param {Number}   duration   duration in seconds
     * @param {Function} onComplete calls this after its over
     */
    move(x, y, z = 0, duration = 1, onComplete = () => {}) {
        gsap.to(
            this.position,
            {
                x: x,
                y: y,
                z: z,
                duration: duration,
                onComplete: onComplete
            }
        );
    }
}

export const PlanetInfo = {
    mercury: {
        planet: {
            radius: 1,
            textureFileName: './static/img/2k_mercury.jpg'
        },
        info: {
            name: 'Mercury',
            description: `Mercury is the smallest planet in the Solar System and the closest to the Sun. Its orbit around the Sun takes 87.97 Earth days, the shortest of all the Sun's planets. It is named after the Roman god Mercurius (Mercury), god of commerce, messenger of the gods, and mediator between gods and mortals, corresponding to the Greek god Hermes. Like Venus, Mercury orbits the Sun within Earth's orbit as an inferior planet, and its apparent distance from the Sun as viewed from Earth never exceeds 28°. This proximity to the Sun means the planet can only be seen near the western horizon after sunset or the eastern horizon before sunrise, usually in twilight. At this time, it may appear as a bright star-like object, but is more difficult to observe than Venus. From Earth, the planet telescopically displays the complete range of phases, similar to Venus and the Moon, which recurs over its synodic period of approximately 116 days.`
        }
    },
    venus: {
        planet: {
            radius: 1.8,
            textureFileName: './static/img/2k_venus_atmosphere.jpg',
            atmosphere: {
                atmosphereHeight: 0.06,
                atmosphereColor: new THREE.Color(0xBEA574),
                atmosphereOpacity: 0.4
            }
        },
        info: {
            name: 'Venus',
            description: `Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. As the brightest natural object in Earth's night sky after the Moon, Venus can cast shadows and can be visible to the naked eye in broad daylight. Venus lies within Earth's orbit, and so never appears to venture far from the Sun, either setting in the west just after dusk or rising in the east a little while before dawn. Venus orbits the Sun every 224.7 Earth days. It has a synodic day length of 117 Earth days and a sidereal rotation period of 243 Earth days. As a consequence, it takes longer to rotate about its axis than any other planet in the Solar System, and does so in the opposite direction to all but Uranus. This means the Sun rises in the west and sets in the east. Venus does not have any moons, a distinction it shares only with Mercury among the planets in the Solar System.`
        }
    },
    earth: {
        planet: {
            radius: 1.8,
            textureFileName: './static/img/2k_earth.jpg',
            specularFileName: './static/img/2k_earth_roughness.png',
            atmosphere: {
                atmosphereHeight: 0.06,
                atmosphereColor: new THREE.Color(0x8180FF),
                atmosphereOpacity: 0.5
            }
        },
        satellites: {
            moon: {
                radius: 1.3,
                textureFileName: './static/img/2k_moon.jpg'
            }
        },
        info: {
            name: 'Earth',
            description: `Earth is the third planet from the Sun and the only astronomical object known to harbor life. While large amounts of water can be found throughout the Solar System, only Earth sustains liquid surface water. About 71% of Earth's surface is made up of the ocean, dwarfing Earth's polar ice, lakes and rivers. The remaining 29% of Earth's surface is land, consisting of continents and islands. Earth's surface layer is formed of several slowly moving tectonic plates, interacting to produce mountain ranges, volcanoes and earthquakes. Earth's liquid outer core generates the magnetic field that shapes Earth's magnetosphere, deflecting destructive solar winds.`
        }
    },
    mars: {
        planet: {
            radius: 1.3,
            textureFileName: './static/img/2k_mars.jpg',
            atmosphere: {
                atmosphereHeight: 0.05,
                atmosphereColor: new THREE.Color(0xDB6B43),
                atmosphereOpacity: 0.1
            }
        },
        info: {
            name: 'Mars',
            description: `Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury. In English, Mars carries the name of the Roman god of war and is often referred to as the "Red Planet". The latter refers to the effect of the iron oxide prevalent on Mars's surface, which gives it a reddish appearance, that is distinctive among the astronomical bodies visible to the naked eye. Mars is a terrestrial planet with a thin atmosphere, with surface features reminiscent of the impact craters of the Moon, and the valleys, deserts and polar ice caps of Earth.`
        }
    },
    jupiter: {
        planet: {
            radius: 2,
            textureFileName: './static/img/2k_jupiter.jpg',
            atmosphere: {
                atmosphereHeight: 0.08,
                atmosphereColor: new THREE.Color(0xD7C2AB),
                atmosphereOpacity: 0.7
            }
        },
        info: {
            name: 'Jupiter',
            description: `Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets in the Solar System combined, but slightly less than one-thousandth the mass of the Sun. Jupiter is the third brightest natural object in the Earth's night sky after the Moon and Venus. People have been observing it since prehistoric times; it was named after the Roman god Jupiter, the king of the gods, because of its observed size.`
        }
    },
    saturn: {
        planet: {
            radius: 1.8,
            textureFileName: './static/img/2k_saturn.jpg',
            atmosphere: {
                atmosphereHeight: 0.08,
                atmosphereColor: new THREE.Color(0xD7C2AB),
                atmosphereOpacity: 0.7
            },
            rings: {
                detail: 128,
                innerRadius: 2.4,
                outerRadius: 4,
                textureFileName: './static/img/2k_saturn_ring_alpha.png',
                angleX: degToRad(-80),
                angleY: degToRad(0),
                angleZ: degToRad(30)
            }
        },
        info: {
            name: 'Saturn',
            description: `Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius of about nine and a half times that of Earth. It only has one-eighth the average density of Earth; however, with its larger volume, Saturn is over 95 times more massive.`
        }
    },
    uranus: {
        planet: {
            radius: 1.5,
            textureFileName: './static/img/2k_uranus.jpg',
            atmosphere: {
                atmosphereHeight: 0.06,
                atmosphereColor: new THREE.Color(0xADE0E7),
                atmosphereOpacity: 0.5
            }
        },
        info: {
            name: 'Uranus',
            description: `Uranus is the seventh planet from the Sun. Its name is a reference to the Greek god of the sky, Uranus, who, according to Greek mythology, was the great-grandfather of Ares (Mars), grandfather of Zeus (Jupiter) and father of Cronus (Saturn). It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. Uranus is similar in composition to Neptune, and both have bulk chemical compositions which differ from that of the larger gas giants Jupiter and Saturn. For this reason, scientists often classify Uranus and Neptune as "ice giants" to distinguish them from the other giant planets.`
        }
    },
    neptune: {
        planet: {
            radius: 1.5,
            textureFileName: './static/img/2k_uranus.jpg',
            atmosphere: {
                atmosphereHeight: 0.06,
                atmosphereColor: new THREE.Color(0x3A51B1),
                atmosphereOpacity: 0.5
            }
        },
        info: {
            name: 'Neptune',
            description: `Neptune is the eighth and farthest-known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet. It is 17 times the mass of Earth, slightly more massive than its near-twin Uranus. Neptune is denser and physically smaller than Uranus because its greater mass causes more gravitational compression of its atmosphere. It is referred to as as one of the solar system's two ice giant planets (the other one being its near-twin Uranus.)`
        }
    }
}

export class PlanetCarousel {

    currentPlanet;

    constructor() {
        this.displayScreen = new THREE.Group();
        
        this.leftButton = new GUIButton({
            text: '<',
            selectionColor: 0x00FF00,
            isEnabled: true
        });
        this.leftButton.onClicked = () => {
            this.previousPlanet();
        };
        this.rightButton = new GUIButton({
            text: '>',
            selectionColor: 0x00FF00,
            isEnabled: true
        });
        this.rightButton.onClicked = () => {
            this.nextPlanet();
        }
        this.leftButton.position.x = -8;
        this.rightButton.position.x = 8;
        this.displayScreen.add(this.leftButton);
        this.displayScreen.add(this.rightButton);

        this.planetArray = [];
        this.planetKeyArray = Object.keys(PlanetInfo);
        for(let i = 0; i < this.planetKeyArray.length; i++){
            let newPlanet = new Planet(
                PlanetInfo[this.planetKeyArray[i]].planet
            );
            this.planetArray.push(newPlanet);
        }
        
        this.currentPlanet = 0;

        this.title = new GUIText({
            text: '',
            fontSize: GUIFontSize.Heading
        });
        this.title.position.y = 5;
        this.displayScreen.add(this.title);

        this.description = new GUIText({
            text: '',
            fontSize: GUIFontSize.SubHeading,
            maxWidth: 10,

        });
        this.description.position.y = -5;
        this.displayScreen.add(this.description);
        
        this.setInfo();

        for(let i = 0; i < this.planetArray.length; i++) {
            this.displayScreen.add(this.planetArray[i]);
        }

        this.movePlanets();
        
    }

    nextPlanet() {
        let i = ++this.currentPlanet;
        i = this.wrapAround(i);

        this.movePlanets();
        this.setInfo();
    }

    previousPlanet() {
        let i = --this.currentPlanet;
        i = this.wrapAround(i);

        this.movePlanets();
        this.setInfo();
    }

    setInfo() {
        this.info = PlanetInfo[this.planetKeyArray[this.currentPlanet]].info;

        this.title.text = this.info.name;
        this.description.text = 
            this.info.description === undefined ? 
                `Don't know much :)` : this.info.description;
        this.title.sync();
        this.description.sync();

    }

    movePlanets() {
        let position;
        let opacity;
        let relIndex;

        for(let i = 0; i < this.planetArray.length; i++) {
            relIndex = i - this.currentPlanet;
            if(relIndex < 0) {
                relIndex = this.planetArray.length + relIndex;
            }else if(relIndex >= this.planetArray.length) {
                relIndex = relIndex - this.planetArray.length;
            }
            position = this.positionFunction(8, 8, relIndex).sub(new THREE.Vector3(0, 0, 8));
            this.planetArray[i].move(
                position.x,
                position.y,
                position.z
            );
            opacity = Math.exp(-Math.abs(position.z) * 6);
            this.planetArray[i].fade(1, opacity);
        }
    }

    positionFunction(a, b, i) {
        //returns ellipse function
        let theta = 2 * Math.PI * (i / this.planetArray.length);
        let z = a * Math.cos(theta);
        let x = b * Math.sin(theta);
        return new THREE.Vector3(x, 0, z);
    }

    wrapAround(i) {
        if(i >= this.planetArray.length) {
            this.currentPlanet = 0;
            i = 0;
        }else if(i < 0) {
            this.currentPlanet = this.planetArray.length - 1;
            i = this.planetArray.length - 1;
        }
        return i;
    }
}