var scene, clock, renderer, camera, spotLight, audio_reader, orbitControl;

window.onload = init;

function init () {
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog(0xffffff, 0.1, 600);

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMapEnabled = true;
    // renderer.shadowMapSoft = true;

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
    gui.add(controls, 'lightX', -100, 100).onChange(function (e) { spotLight.position.x = e; });
    gui.add(controls, 'lightY', -100, 100).onChange(function (e) { spotLight.position.y = e; });
    gui.add(controls, 'lightZ', -100, 100).onChange(function (e) { spotLight.position.z = e; });

    // methods.figures.init();

    methods.audio.get("assets/audio/kuroiumi - sanremo.mp3");
    methods.spaceship.create();
    methods.stripes.init();
    methods.camera.create();

    function render () {
        var delta = clock.getDelta();

        var audioData = audio_reader.getData();

        // methods.figures.render();
        methods.spaceship.update(audioData);
        methods.stripes.update(audioData);
        // methods.camera.update();

        orbitControl.update(delta);

        requestAnimationFrame(render);
        renderer.render(scene, camera);
        // composer.render(delta);
    }
    document.getElementById("webgl").appendChild(renderer.domElement);

    render();
}

var methods = {
    camera : {
        cameraStep : 0,
        create : function () {
            camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.x = 100;
            camera.position.y = 80;
            camera.position.z = 80;
            // camera.lookAt(methods.spaceship.data.spaceshipModel.position);
            camera.lookAt(scene.position);

            orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
            orbitControl.target = new THREE.Vector3(0, 0, 0);
            orbitControl.maxDistance = 800;
        },
        update : function () {
            // this.cameraStep += 0.004;
            // camera.position.x = Math.cos(this.cameraStep) * 100;
            // camera.position.z = Math.sin(this.cameraStep) * 40;
        }
    },
    audio : {
        get : function (src) {
            audio_reader = new AudioReader();
            audio_reader.init();
            audio_reader.loadFile(src);
        }
    },
    stripes : {
        data : {
            group : new THREE.Mesh(),
            numberInStep : 1,
        },
        init : function () {
            var self = this;

            scene.add(this.data.group);

            setInterval(function () {
                for (var i = 0; i <= self.data.numberInStep; i++) {
                    self.create();
                }
            }, 20);
            
        },
        create : function (opts) {
            var opts = opts || {
                position : new THREE.Vector3(
                    -600, 
                    (Math.random() > 0.5 ? 1 : -1) * ~~(Math.random() * 300), 
                    (Math.random() > 0.5 ? 1 : -1) * ~~(Math.random() * 300)
                )
            };
            var geometry = new THREE.PlaneBufferGeometry(3, 2);
            // var meshMaterial = new THREE.MeshLambertMaterial({ color : 'white', side : THREE.DoubleSide, transparent : true});
            var meshMaterial = new THREE.MeshBasicMaterial({ color : 'white' , side : THREE.DoubleSide, transparent : true });
            plane = new THREE.Mesh(geometry, meshMaterial);
            plane.position.x = opts.position.x;
            plane.position.y = opts.position.y;
            plane.position.z = opts.position.z;

            this.data.group.add(plane);

        },
        update : function (audioData) {
            var multiplier = 1, scaleMiltiplier = 1, stepMuptiplier = 0, opacity = 0.5;
            if (audioData.isPlaying) {
                multiplier += audioData.volume * 5;
                scaleMiltiplier += audioData.volume * 40;
                stepMuptiplier += audioData.volume * 3;
                opacity += audioData.volume * 1.5;
            }
            var self = this;
            this.data.group.children.forEach(function (stripe) {
                stripe.position.x += multiplier * 10;
                stripe.scale.x = scaleMiltiplier;
                stripe.material.opacity = opacity;
                if (stripe.position.x >= 300) {
                    self.data.group.remove(stripe);
                }
            })
            self.data.numberInStep += ~~(stepMuptiplier);
            self.data.numberInStep = self.data.numberInStep <= 5 ? self.data.numberInStep : 5;
        }
    },
    spaceship : {
        data : {
            // spaceshipModel : new THREE.Group(), // сам обьект
            spaceshipModel : null, // сам обьект
            spaceshipPivot : new THREE.Group(), // если нао вращать относительно центра
            step : 0,
        },
        create : function () { 

            var self = this;

            var loader = new THREE.OBJLoader();
            loader.load('assets/textures/freedom7.obj', function (loadedMesh) {
                var material = new THREE.MeshLambertMaterial({color: 'silver'});

                loadedMesh.children.forEach(function (child) {
                    child.material = material;
                    child.geometry.computeFaceNormals();
                    child.geometry.computeVertexNormals();
                });

                self.data.spaceshipModel = loadedMesh;
                loadedMesh.scale.set(10, 10, 10);
                loadedMesh.rotation.x = 0.3;
                loadedMesh.rotation.z = 1/2 * Math.PI;
                loadedMesh.position.x = 50;
                scene.add(self.data.spaceshipModel);
            });


            // var self = this,
            //     ship = this.data.spaceshipModel;

            // [1,2,3,4,5].forEach(function (number) {
            //     var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
            //     var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
            //     var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            //     cube.position.x = 20 * number;

            //     ship.add(cube);
            // })

            // ship.position.x = 0;

            // var box = new THREE.Box3().setFromObject( ship );
            // box.center( ship.position ); // this re-sets the mesh position
            // ship.position.multiplyScalar( - 1 );

            // this.data.spaceshipPivot = new THREE.Group();
            // this.data.spaceshipPivot.add(ship);
            // scene.add(this.data.spaceshipPivot);

        },
        update : function (audioData) {
            var multiplier = 1, positionMultiplier = 3;

            if (audioData.isPlaying) {
                multiplier += audioData.volume * 20;
            }
            this.data.step += 0.04 * multiplier;
            if (this.data.spaceshipModel) {
                this.data.spaceshipModel.position.z = Math.cos(this.data.step) * positionMultiplier;
                this.data.spaceshipModel.position.y = Math.sin(this.data.step) * positionMultiplier;
            }
            // this.data.spaceshipPivot.position.z = Math.cos(this.data.step) * positionMultiplier;
            // this.data.spaceshipPivot.position.y = Math.sin(this.data.step) * positionMultiplier;
        }
    },
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