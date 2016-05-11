var planets = [
    { name : 'sun', radius : 0, color : 'yellow', period : 0, size : 60 },
    { name : 'planet-1', radius : 110, color : 'orange', period : 0.003, size : 1, rings: [
        { name: 'ring-3', delta_radius: 3, color: 'yellow'},
    ]},
    { name : 'planet-2', radius : 120, color : 'lightblue', period : 0.004, size : 2 },
    { name : 'earth', radius : 130, color : 'green', period : 0.005, size : 5, moons : [
        { name : 'moon', radius : 7, color : 'white', period : 0.04, size : 1 }
    ]},
    { name : 'planet-4', radius : 145, color : 'red', period : 0.006, size : 4, rings: [
        { name: 'ring-1', delta_radius: 2, color: 'white'},
        { name: 'ring-2', delta_radius: 1, color: 'green'},
    ]},
    { name : 'planet-5', radius : 165, color : 'cyan', period : 0.007, size : 5, rings: [
        { name: 'ring-4', delta_radius: 5, color: 'blue'}
    ]},
    { name : 'planet-6', radius : 185, color : 'magenta', period : 0.009, size : 6, moons : [
        { name : 'moon-1', radius : 8, color : 'white', period : 0.04, size : 1 },
        { name : 'moon-2', radius : 10, color : 'white', period : 0.03, size : 1.4 },
        { name : 'moon-3', radius : 12, color : 'white', period : 0.02, size : 1.5 },
        { name : 'moon-4', radius : 15, color : 'white', period : 0.05, size : 1.8 },
    ]},
    { name : 'planet-7', radius : 210, color : 'orange', period : 0.01, size : 7 }
]

function setup() {

    var scene = new THREE.Scene();
    var clock = new THREE.Clock();

    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = -250;
    camera.position.y = 400;
    camera.position.z = 200;
    camera.lookAt(scene.position);

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var ambiColor = "#0c0c0c";
    var ambientLight = new THREE.AmbientLight(ambiColor);
    scene.add(ambientLight);

    var planetGroup = new THREE.Mesh();
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
  
    function render () {

        planetGroup.children.forEach(methods.planet.update);
        methods.sun.update(clock);
        methods.camera.update(camera, scene);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    document.getElementById("webgl").appendChild(renderer.domElement);
    render();
}

var methods = {
    sun : {
        create : function (planet, scene) {
            geometry = new THREE.SphereGeometry(planet.size, 40, 40);
            var lavaTexture = new THREE.ImageUtils.loadTexture( 'assets/images/sun.jpg');
            lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping; 
            // multiplier for distortion speed      
            var baseSpeed = 0.01;
            // number of times to repeat texture in each direction
            var repeatS = repeatT = 6.0;
            
            // texture used to generate "randomness", distort all other textures
            var noiseTexture = new THREE.ImageUtils.loadTexture( 'assets/images/cloud.png' );
            noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping; 
            // magnitude of noise effect
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
            var bumpSpeed   = 0.02;
            // magnitude of normal displacement
            var bumpScale   = 20.0;
            
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
            var material = new THREE.ShaderMaterial( 
            {
                uniforms: customUniforms,
                vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
                fragmentShader: document.getElementById( 'fragmentShader' ).textContent
            }   );
            sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = planet.radius;
            sphere.position.y = 0;
            sphere.position.z = 0;
            sphere.rotation.z = -7/16 * Math.PI;
            sphere.name = 'sun';

            pointColor = "orange";
            pointLight = new THREE.PointLight(pointColor);
            pointLight.distance = 500;
            pointLight.intensity = 2;

            scene.add(sphere).add(pointLight);
        },
        update : function (clock) {
            var delta = clock.getDelta();
            customUniforms.time.value += delta;   
        }
    },
    planet : {
        create : function (planet, scene) {
            geometry = new THREE.SphereGeometry(planet.size, 20, 20);
            material = new THREE.MeshPhongMaterial({color: planet.color});
            sphere = new THREE.Mesh(geometry, material);

            sphere.position.x = planet.radius;
            sphere.position.y = 0;
            sphere.position.z = 0;

            sphere.radius = planet.radius;
            sphere.currentStep = 0;
            sphere.period = planet.period;
            sphere.name = planet.name;

            if (planet.moons) {
                sphere.moons = new THREE.Mesh();

                for (var k in planet.moons) {
                    moonData = planet.moons[k];
                    geometry = new THREE.SphereGeometry(moonData.size, 20, 20);
                    material = new THREE.MeshPhongMaterial({color: moonData.color});
                    moon = new THREE.Mesh(geometry, material);
                    moon.radius = moonData.radius;
                    moon.currentStep = 0;
                    moon.period = moonData.period;
                    moon.name = moonData.name;

                    sphere.moons.add(moon);
                }
            }

            if (planet.rings) {
                sphere.rings = new THREE.Mesh();
                // { name: 'ring-1', delta_radius: 3, color: 'white'},
                step = 0;

                for (var k in planet.rings) {
                    step += 0.05;
                    var ring = planet.rings[k], 
                        r1 = planet.size * (1.25 + step),
                        r2 = r1 + ring.delta_radius,
                        geometry = new THREE.RingGeometry(r1, r2, 32);
                    material = new THREE.MeshPhongMaterial({color: ring.color, side: THREE.DoubleSide });
                    three_ring = new THREE.Mesh(geometry, material);
                    three_ring.name = ring.name;

                    sphere.rings.add(three_ring);
                }
            }

            scene.add(sphere).add(sphere.moons).add(sphere.rings);
        },
        update : function (planet) {
            if (!planet.name || planet.name == 'sun') return;

            planet.currentStep += planet.period;
            planet.position.x = Math.cos(planet.currentStep) * planet.radius;
            planet.position.z = Math.sin(planet.currentStep) * planet.radius;

            if (planet.moons) {
                planet.moons.children.forEach(function (moon) {
                    moon.currentStep += moon.period;
                    moon.position.x = planet.position.x + (Math.cos(moon.currentStep) * moon.radius);
                    moon.position.z = planet.position.z + (Math.sin(moon.currentStep) * moon.radius);
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
            this.cameraStep += 0.0001;
            camera.position.x = Math.cos(this.cameraStep) * -250;
            camera.position.z = Math.sin(this.cameraStep) * 200;
            camera.lookAt(scene.position);
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
