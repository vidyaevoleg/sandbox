var planetGroup, camera, controls, audio_reader;
function setup() {

    var scene = new THREE.Scene();
    var clock = new THREE.Clock();
    var stats = initStats();
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 350;
    camera.position.y = 300;
    camera.position.z = 200;
    camera.lookAt(scene.position);

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    var renderPass = new THREE.RenderPass(scene, camera);
    var effectFilm = new THREE.FilmPass(1.3, 0.7, 256, false);
    effectFilm.renderToScreen = true;

    var effectGlitch = new THREE.GlitchPass(64);
    effectGlitch.renderToScreen = true;

    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(effectFilm);
    // composer.addPass(effectGlitch);

    orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.target = new THREE.Vector3(0, 0, 0);
    orbitControl.maxDistance = 800;

    var ambiColor = "#0c0c0c";
    var ambientLight = new THREE.AmbientLight(ambiColor);
    scene.add(ambientLight);

    planetGroup = new THREE.Mesh();
    scene.add(planetGroup);

    for (var i in planets) {
        var pl = planets[i];

        if (pl.name == 'sun') {
            methods.sun.create(pl, planetGroup);
        } else {
            methods.planet.create(pl, planetGroup);
        }
    }

    methods.particles.create(scene);
    methods.comets.startCreation(scene);
    methods.getAudio("assets/audio/sound.mp3");

    var controls = new function () {
        this.cameraY = camera.position.y;
        this.scanlinesCount = 256;
        this.grayscale = false;
        this.scanlinesIntensity = 0.6;
        this.noiseIntensity = 0.8;

        this.updateEffectFilm = function () {
            effectFilm.uniforms.grayscale.value = controls.grayscale;
            effectFilm.uniforms.nIntensity.value = controls.noiseIntensity;
            effectFilm.uniforms.sIntensity.value = controls.scanlinesIntensity;
            effectFilm.uniforms.sCount.value = controls.scanlinesCount;
        };
    };

    var gui = new dat.GUI();

    gui.add(controls, 'cameraY', camera.position.y - 500, camera.position.y + 500).onChange(function (e) {
      camera.position.y = e;
    });
    guiScale = gui.addFolder('Camera effect');

    guiScale.add(controls, "scanlinesIntensity", 0, 1).onChange(controls.updateEffectFilm);
    guiScale.add(controls, "noiseIntensity", 0, 3).onChange(controls.updateEffectFilm);
    guiScale.add(controls, "grayscale").onChange(controls.updateEffectFilm);
    guiScale.add(controls, "scanlinesCount", 0, 2048).step(1).onChange(controls.updateEffectFilm);
  
    function render () {

        var delta = clock.getDelta();

        var data = audio_reader.data();

        console.log(data);

        debugger; // ТУТ НЕТ

        stats.update();
        planetGroup.children.forEach(methods.planet.update);
        methods.sun.update(clock);
        methods.camera.update(camera, scene);
        methods.comets.update(scene);

        orbitControl.update(delta);

        requestAnimationFrame(render);
        composer.render(delta);
        // renderer.render(scene, camera);
    }

    document.getElementById("webgl").appendChild(renderer.domElement);


    function initStats() {

        stats = new Stats();
        stats.setMode(0);

        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.getElementById("stats").appendChild(stats.domElement);

        return stats;
    }
    render();
}

var methods = {
    getAudio : function (src) {
        audio_reader = new AudioReader();
        audio_reader.init();
        audio_reader.loadFile(src);
    },
    sun : {
        create : function (planet, scene) {
            geometry = new THREE.SphereGeometry(planet.size, 40, 40);
            var lavaTexture = new THREE.ImageUtils.loadTexture( 'assets/images/sun.jpg');
            lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping; 

            var baseSpeed = 0.01;
            var repeatS = repeatT = 6.0;
            
            var noiseTexture = new THREE.ImageUtils.loadTexture( 'assets/images/cloud.png' );
            noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
            var noiseScale = 0.2;
            
            // texture to additively blend with base image texture
            var blendTexture = new THREE.ImageUtils.loadTexture( 'assets/images/sun.jpg' );
            blendTexture.wrapS = blendTexture.wrapT = THREE.RepeatWrapping; 
            // multiplier for distortion speed 
            var blendSpeed = 0.01;
            // adjust lightness/darkness of blended texture
            var blendOffset = 0.01;

            // texture to determine normal displacement
            var bumpTexture = noiseTexture;
            bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
            // multiplier for distortion speed      
            var bumpSpeed = 0.01;
            // magnitude of normal displacement
            var bumpScale = 2.0;
            
            customUniforms = {
                baseTexture:    { type: "t", value: lavaTexture },
                baseSpeed:      { type: "f", value: baseSpeed },
                repeatS:        { type: "f", value: repeatS },
                repeatT:        { type: "f", value: repeatT },
                noiseTexture:   { type: "t", value: noiseTexture },
                noiseScale:     { type: "f", value: noiseScale },
                blendTexture:   { type: "t", value: blendTexture },
                blendSpeed:     { type: "f", value: blendSpeed },
                blendOffset:    { type: "f", value: blendOffset },
                bumpTexture:    { type: "t", value: bumpTexture },
                bumpSpeed:      { type: "f", value: bumpSpeed },
                bumpScale:      { type: "f", value: bumpScale },
                alpha:          { type: "f", value: 1.0 },
                time:           { type: "f", value: 1.0 }
            };
            
            // create custom material from the shader code above
            //   that is within specially labeled script tags
            var material = new THREE.ShaderMaterial({
              uniforms: customUniforms,
              vertexShader:   document.getElementById('vertexShader').textContent,
              fragmentShader: document.getElementById('fragmentShader').textContent
            });
            sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = planet.radius;
            sphere.position.y = 0;
            sphere.position.z = 0;
            sphere.rotation.z = -7/16 * Math.PI;
            sphere.name = 'sun';

            // pointColor = "#ede843";
            pointColor = "#fff";
            pointLight = new THREE.PointLight(pointColor);
            pointLight.distance = 800;
            pointLight.intensity = 1.1;

            scene.add(sphere);
            scene.add(pointLight);
        },
        update : function (clock) {
            var delta = clock.getDelta();
            customUniforms.time.value += delta;   
        }
    },
    comets : {
        data : {
            loadedMesh : null
        },
        startCreation : function (scene) {
            this.data.comets = new THREE.Mesh();
            scene.add(this.data.comets);

            setInterval(function () {
                this.create(scene);
            }.bind(this), 5000);
        },
        loadMesh : function (fn) {
            var loader = new THREE.OBJLoader();
            loader.load('assets/textures/comet.obj', function (comet) {
                this.data.loadedMesh = comet;
                fn(comet);
            }.bind(this));
        },
        create : function create () {
            if (this.data.loadedMesh) {
                fn(this.data.loadedMesh.clone());
            } else {
                this.loadMesh(fn);
            }

            function fn(comet) {
                var material = new THREE.MeshLambertMaterial({color: '#a43'});
                comet.children.forEach(function (child) {
                    child.material = material;
                    child.geometry.computeFaceNormals();
                    child.geometry.computeVertexNormals();
                });

                mesh = comet;
                comet.scale.set(10, 10, 10);
                comet.rotation.x = -0.3;

                var range = 1200;

                ['x', 'y', 'z'].map(function (el) {
                    comet.position[el] = Math.random() * range - range / 2;
                });
                comet.position.y = camera.position.y + 100;

                comet.destinationPoint = planetGroup.children.filter(function (el) {
                    return el._type == 'planet';
                })[~~(Math.random() * 6)].position;

                var iterations = 400;
                var diffs = {
                    x : comet.destinationPoint.x - comet.position.x,
                    y : comet.destinationPoint.y - comet.position.y,
                    z : comet.destinationPoint.z - comet.position.z
                };

                var speed = {
                    x : diffs.x / iterations,
                    y : diffs.y / iterations,
                    z : diffs.z / iterations
                };
                comet.speed = speed;
                methods.comets.data.comets.add(comet);
            }
        },
        update : function (scene) {
            this.data.comets.children.forEach(function (comet) {
                'xyz'.split('').map(function (el) {
                    comet.position[el] += comet.speed[el];
                    comet.rotation[el] += 0.01;
                });
            });
        }
    },
    planet : {
        create : function (planet, scene) {
            geometry = new THREE.SphereGeometry(planet.size, 20, 20);
            if (planet.texture) {
              texture = new THREE.ImageUtils.loadTexture('assets/images/' + planet.texture + '.jpg');
              material = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide });
            } else {
              material = new THREE.MeshPhongMaterial({color: planet.color, side: THREE.DoubleSide});
            }

            var sphere = new THREE.Mesh(geometry, material);
            sphere.x0 = planet.radius;
            sphere.y0 = planet.radius * 0.8 + planet.radius * 0.2 * Math.random();
            sphere.z0 = planet.radius * 0.5 + planet.radius * 0.5 * Math.random();
            sphere.position.x = sphere.x0;
            sphere.position.y = sphere.y0;
            sphere.position.z = sphere.z0;

            sphere.radius = planet.radius;
            sphere.currentStep = 0;
            sphere.period = planet.period;
            sphere.name = planet.name;
            sphere._type = 'planet';

            if (planet.moons) {
                sphere.moons = new THREE.Mesh();

                for (var k in planet.moons) {
                    moonData = planet.moons[k];
                    geometry = new THREE.SphereGeometry(moonData.size, 20, 20);
                    pic_ind = parseInt(3 * Math.random()) + 1;
                    texture_pic = 'assets/images/plane' + pic_ind + '.jpg'
                    texture = new THREE.ImageUtils.loadTexture(texture_pic);
                    material = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide });                    
                    moon = new THREE.Mesh(geometry, material);
                    moon.radius = moonData.radius;
                    moon.currentStepX = 0;
                    moon.currentStepY = 0;
                    moon.currentStepZ = 0;
                    moon.periods = moonData.periods;
                    moon.name = moonData.name;

                    sphere.moons.add(moon);
                }

                scene.add(sphere.moons);

            }

            if (planet.rings) {
                sphere.rings = new THREE.Mesh();
                step = 0;

                for (var k in planet.rings) {
                    step += 0.05;
                    var ring = planet.rings[k], 
                        r1 = planet.size * (1.25 + step) * k * 0.4,
                        r2 = r1 + ring.delta_radius,
                        geometry = new THREE.RingGeometry(r1, r2, 32);
                    material = new THREE.MeshPhongMaterial({color: ring.color, side: THREE.DoubleSide });
                    three_ring = new THREE.Mesh(geometry, material);
                    three_ring.rotation.z = -3/4 * Math.PI;
                    three_ring.rotation.x = 1/4 * Math.PI;
                    three_ring.name = ring.name;

                    sphere.rings.add(three_ring);
                }
                scene.add(sphere.rings);
            }
        
            scene.add(sphere);
        },
        update : function (planet) {
            if (!planet.name || planet.name == 'sun') return;

            planet.currentStep += planet.period;
            planet.position.x = Math.cos(planet.currentStep) * planet.x0;
            planet.position.z = Math.sin(planet.currentStep) * planet.z0;

            if (planet.moons) {
                planet.moons.children.forEach(function (moon) {
                    
                    if (moon.periods) {
                        moon.currentStepX += moon.periods.x;
                        moon.currentStepZ += moon.periods.z;

                        moon.position.x = planet.position.x + (Math.cos(moon.currentStepX) * moon.radius);
                        moon.position.z = planet.position.z + (Math.sin(moon.currentStepZ) * moon.radius);
                        moon.position.y = planet.position.y + (Math.sin(moon.currentStepY) * moon.radius);
                    }
                });
            }

            if (planet.rings) {
                planet.rings.children.forEach(function (ring) {
                    ring.position.copy(planet.position);
                    ring.rotation.z = (planet.currentStep / 10) * 2 * Math.PI;
                });
            }
        }
    },
    camera : {
        cameraStep : 0,
        update : function (camera, scene) {
            this.cameraStep += 0.0002;
            camera.position.x = Math.cos(this.cameraStep) * -250;
            camera.position.z = Math.sin(this.cameraStep) * 200;
            camera.lookAt(scene.position);

            // orbitControl.target.x = camera.position.x;
            // orbitControl.target.z = camera.position.z;
        }
    },
    particles : {
        create : function (group) {
            var geom = new THREE.Geometry(),
                material = new THREE.PointCloudMaterial({
                size: 1,
                opacity : 0.5,
                transparent : true,
                color: 'white'
            }),
            count = 10000;
            
            while (count--) {
                var range = range || 1200;
                var particle = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
                var color = new THREE.Color(0x00ff00);
                color.setHSL(color.getHSL().h, color.getHSL().s, Math.random() * color.getHSL().l);

                geom.vertices.push(particle);
                geom.colors.push(color);
            }
            
            cloud = new THREE.PointCloud(geom, material);
            cloud.name = "particles";

            group.add(cloud);
        }
    }
}

window.onload = setup;
