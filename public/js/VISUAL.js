var scene, clock, renderer, camera, spotLight;

window.onload = init;

function init () {
    scene = new THREE.Scene();
	clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMapEnabled = true;
    // renderer.shadowMapSoft = true;

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 100;
    camera.position.y = 40;
    camera.position.z = 40;
    camera.lookAt(scene.position);

    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(50, 100, 80);
    spotLight.castShadow = true;
    scene.add(spotLight); 

    var renderPass = new THREE.RenderPass(scene, camera);
    var effectFilm = new THREE.FilmPass(1.3, 0.7, 256, false);
    effectFilm.renderToScreen = true;

    var effectGlitch = new THREE.GlitchPass(64);
    effectGlitch.renderToScreen = true;

    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(effectGlitch);
    // composer.addPass(effectFilm);

    var controls = new function () {
        this.lightX = 50;
        this.lightY = 100;
        this.lightZ = 80;
    };

    var gui = new dat.GUI();
    gui.add(controls, 'lightX', -100, 100).onChange(function (e) {
    	spotLight.position.x = e;
    });
    gui.add(controls, 'lightY', -100, 100).onChange(function (e) {
    	spotLight.position.y = e;
    });
    gui.add(controls, 'lightZ', -100, 100).onChange(function (e) {
    	spotLight.position.z = e;
    });

    methods.figures.init();

	function render () {
	    var delta = clock.getDelta();

	    methods.figures.render();

	    requestAnimationFrame(render);
	    // renderer.render(scene, camera);
	    composer.render(delta);
	}
	document.getElementById("webgl").appendChild(renderer.domElement);

	render();
}

var methods = {
	figures : {
		data : {
			objects : null,
			transitionFunctions : {}
		},
		init : function () {
			this.data.objects = new THREE.Mesh();
			scene.add(this.data.objects);

			this.cube.create();
		},
		render : function () {
			var self = this;
			this.data.objects.children.forEach(function (figure) {
				self[figure.type].render(figure);

				for (var i in self.data.transitionFunctions) {
					self.data.transitionFunctions[i].fn();
				}
			});
		},
		cube : {
			create : function () {
				var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
		        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
		        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		        cube.type = 'cube';
		        methods.figures.data.objects.add(cube);

		        this.scale(cube, 1.4, 1, 0.4, 0.2, 1);
			},
			render : function (figure) {
				figure.rotation.x += 0.02;
				figure.rotation.y += 0.02;
				figure.rotation.z += 0.02;
			},
			scale : function(figure, maxScale, minScale, transitionTimeFirst, transitionTimeSecond, delay, callbackMax, callbackMin) {
				this.id = figure.uuid;
				figure.inTransition = true;
				var FunctionObject = function (id) {
					var self = this;

					this.id = id;
					this.currentScale = figure.scale.x;

					this.maxScale = maxScale * this.currentScale;
					this.minScale = minScale * this.currentScale;

					this.direction = 'toMax';

					this.fn = function () {
						
						// обработка

						if (figure.scale.x < self.maxScale && this.direction == 'toMax') {
							'xyz'.split('').map(function (coord) {
								figure.scale[coord] += (self.maxScale - self.currentScale) / (transitionTimeFirst * 1000) * 36;
							});
						} 
						else if (this.direction == 'toMax') {
							this.direction = 'toMin';
							this.currentScale = figure.scale.x;
						}
						else if (figure.scale.x > self.minScale && this.direction == 'toMin') {
							'xyz'.split('').map(function (coord) {
								figure.scale[coord] += (self.minScale - self.currentScale) / (transitionTimeSecond * 1000) * 36;
							});
						}

						// по условию удаляем функцию
						if (figure.scale.x < self.minScale && this.direction == 'toMin') {
							delete methods.figures.data.transitionFunctions[id];

							'xyz'.split('').map(function (coord) {
								figure.scale[coord] = self.minScale;
							});
							console.log('function removed');
							// для теста запускаем сразу заново после удаления
							methods.figures.cube.scale(figure, 2, 1.02, 0.4, 0.2);
						}
					}
				} 
				if (!delay) {
					methods.figures.data.transitionFunctions[figure.uuid] = new FunctionObject(figure.uuid);
				} else {
					setTimeout(function () {
						methods.figures.data.transitionFunctions[figure.uuid] = new FunctionObject(figure.uuid);
					}, delay * 1000);
				}
			}
		}
	}
}