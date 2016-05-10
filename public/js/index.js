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

  var three_planets = new THREE.Mesh();

  for ( var i = 0; i < planets.length; i++ ) {
    new_planet = new ObjectConstructor(planets[i]);

    for ( var obj in new_planet) {
      if (new_planet[obj]) {
        scene.add(new_planet[obj]);
      }
    }

  }

  scene.add(three_planets);
  scene.add(new CloudConstructor())

  var cameraStep = 0;
  
    function render () {

        scene.children.forEach(function (e) {

            if (!e.name || e.name == 'sun' || e.name == "particles" ) return;

            e.currentStep += e.period;
            e.position.x = Math.cos(e.currentStep) * e.radius;
            e.position.z = Math.sin(e.currentStep) * e.radius;

            if (e.moons) {
                e.moons.children.forEach(function (moon) {
                    moon.currentStep += moon.period;
                    moon.position.x = e.position.x + (Math.cos(moon.currentStep) * moon.radius);
                    moon.position.z = e.position.z + (Math.sin(moon.currentStep) * moon.radius);
                });
            }

            if (e.rings) {
                e.rings.children.forEach(function (ring) {
                    ring.position.copy(e.position);
                    ring.rotation.z = (e.currentStep / 10) * 2 * Math.PI;
                });
            }
        });

        cameraStep += 0.0001;
        camera.position.x = Math.cos(cameraStep) * -250;
        camera.position.z = Math.sin(cameraStep) * 200;
        camera.lookAt(scene.position);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }


    document.getElementById("webgl").appendChild(renderer.domElement);
    render();


    function ObjectConstructor (planet) {
    
        if (planet.name == 'sun') {
            return new SunConstructor(planet);
        } else return new PlanetConstructor(planet);

        function SunConstructor(planet) {
            geometry = new THREE.SphereGeometry(planet.size, 40, 40);
            // material = new THREE.MeshBasicMaterial({color: planet.color});
            material = new THREE.MeshPhongMaterial({
                color: planet.color, 
                shininess: 100.0,
                ambient: 0xffff00,
                emissive: 0xffff00,
                specular: 0xffffff 
            });
            sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = planet.radius;
            sphere.position.y = 0;
            sphere.position.z = 0;
            sphere.name = 'sun';

            pointColor = "orange";
            pointLight = new THREE.PointLight(pointColor);
            pointLight.distance = 500;
            pointLight.intensity = 2;

            return {
                sun : sphere,
                pointLight: pointLight        
            }
        }

        function PlanetConstructor(planet) {
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

            return {
                planet: sphere,
                moons: sphere.moons, 
                rings: sphere.rings
            }
        }
    }

    function CloudConstructor() {
        var geom = new THREE.Geometry(),
            material = new THREE.PointCloudMaterial({
            size: 1,
            opacity : 0.5,
            transparent : true,
            color: 'white'
        }),
        count = 10000;
        
        while (count--) {
            var new_particle = new ParticleConstructor();

            geom.vertices.push(new_particle.particle);
            geom.colors.push(new_particle.color);
        }
        
        cloud = new THREE.PointCloud(geom, material);
        cloud.name = "particles";

        return cloud;


        function ParticleConstructor( range) {

            var range = range || 1200;
            var particle = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
            var color = new THREE.Color(0x00ff00);
            color.setHSL(color.getHSL().h, color.getHSL().s, Math.random() * color.getHSL().l);

            return {
                particle : particle,
                color : color
            }
        }
    }
}
window.onload = setup;
