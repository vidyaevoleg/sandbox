var scene, camera, renderer;

function setup() {

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColorHex()
  renderer.setClearColor(new THREE.Color(0xEEEEEE));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.x = -30;
  camera.position.y = 40;
  camera.position.z = 30;

  var axes = new THREE.AxisHelper(20);
  scene.add(axes);

  planeGeometry = new THREE.PlaneGeometry( 60, 20 );
  planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 15;
  plane.position.y = 0;
  plane.position.z = 0;
  scene.add(plane);

  cubeGeometry = new THREE.CubeGeometry( 4, 4, 4);
  cubeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.x = -4;
  cube.position.y = 3;
  cube.position.z = 0;
  scene.add(cube);
  cube.castShadow = true;


  sphereGeometry = new THREE.SphereGeometry( 4, 20, 20);
  sphereMaterial = new THREE.MeshBasicMaterial({color: 0x7777ff});
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.x = 20;
  sphere.position.y = 4;
  sphere.position.z = 2;
  sphere.castShadow = true;
  scene.add(sphere);

  var ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  var spotLight = new THREE.SpotLight( 0xed3b3b );
  spotLight.position.set( -40, 60, -10 );
  spotLight.castShadow = true;
  scene.add( spotLight );



  stats = initStats();

  document.getElementById("webgl").appendChild(renderer.domElement);
  
  var step = 0;

  var controls = new function () {
    this.rotationSpeed = 0.02;
    this.bouncingSpeed = 0.03;
  };

  var gui = new dat.GUI();
  gui.add(controls, 'rotationSpeed', 0, 0.5);
  gui.add(controls, 'bouncingSpeed', 0, 0.5);

  camera.lookAt(scene.position);

  render();

  function render() {
    stats.update();
    step += controls.bouncingSpeed;

    cube.position.x = -10 + ((Math.cos(step)));
    cube.position.z = -10 + ((Math.sin(step)));

    sphere.position.x = 20 + ( 5 * (Math.cos(step)));
    sphere.position.z = 20 + ( 5 * (Math.sin(step)));

    // render using requestAnimationFrame
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  function initStats() {
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("stats").appendChild( stats.domElement );
    return stats;
  }

}



window.onload = setup;