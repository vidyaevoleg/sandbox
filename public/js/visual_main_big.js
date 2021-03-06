/*
   __  ____          _   ___
  / / / / /  ___ ___| | / (_)__
 / /_/ / _ `/ -_) __/ |/ / /_ /
 `____/_.__/`__/_/  |___/_//__/

UBERVIZ (c) 2015 by @felixturner
www.uberviz.io

*/
var AudioHandler = function() {
        function e() {
            UberVizMain.getIsMobile() && (I.useAudioElement = !1), events.on("update", v), events.on("midi", T);
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext, V = new window.AudioContext
            } catch (e) {
                return $("#play-btn").hide(), $("#warning").show(), void $("#warning").html("Sorry!<br>This browser does not support the Web Audio API. <br>Please use Chrome, Safari or Firefox.")
            }
            D = V.createGain(), D.connect(V.destination), U = V.createAnalyser(), U.smoothingTimeConstant = .3, U.fftSize = 1024, b = U.frequencyBinCount, S = Math.floor(b / L), y = new Uint8Array(b), z = new Uint8Array(b);
            for (var t = 0; G > t; t++) _.push(0), X.push(0);
            R = new Uint8Array(3 * L), E = new THREE.DataTexture(R, L, 1, THREE.RGBFormat);
            var o = document.getElementById("audio-debug");
            w = o.getContext("2d"), w.width = J, w.height = K, w.fillStyle = "rgb(40, 40, 40)", w.lineWidth = 2, w.strokeStyle = "rgb(255, 255, 255)", $("#audiodisplayCtx").hide(), C = w.createLinearGradient(0, 0, 0, K), C.addColorStop(1, "#330000"), C.addColorStop(.85, "#aa0000"), C.addColorStop(.5, "#aaaa00"), C.addColorStop(0, "#aaaaaa"), ConfigHandler.getConfig().useMic ? c() : ConfigHandler.getConfig().autoPlayAudio && n()
        }

        function n() {
            I.useAudioElement ? i() : a()
        }

        function t() {
            A.play()
        }

        function o() {
            events.emit("seeked")
        }

        function i() {
            A = new Audio, A.setAttribute("src", ConfigHandler.getConfig().audioURL), A.setAttribute("controls", "controls"), A.setAttribute("preload", "auto"), A.addEventListener("seeked", o, !0), A.loop = !0, $(A).addClass("audio-elem"), $(A).insertAfter("#controls-header"), $("#preloader").hide(), P = V.createMediaElementSource(A), P.connect(U), P.connect(D), Q = !0, A.play(), BPMHandler.onBPMBeat(), l()
        }

        function a() {
            var e = new XMLHttpRequest;
            e.open("GET", ConfigHandler.getConfig().audioURL, !0), e.responseType = "arraybuffer", e.onload = function() {
                V.decodeAudioData(e.response, function(e) {
                    M = e, r()
                }, function(e) {
                    console.log(e)
                })
            }, e.send()
        }

        function r() {
            ConfigHandler.getConfig().useMic = !1, P = V.createBufferSource(), P.connect(U), P.connect(D), P.buffer = M, P.loop = !0, Q = !0, $("#preloader").hide(), ConfigHandler.getConfig().doLoop ? (P.loopStart = ConfigHandler.getConfig().loopStart, P.loopEnd = ConfigHandler.getConfig().loopEnd, P.start(0, ConfigHandler.getConfig().loopStart)) : (P.start(0), B = Date.now()), BPMHandler.onBPMBeat(), l()
        }

        function l() {
            D.gain.value = ConfigHandler.getConfig().mute ? 0 : 1
        }

        function s() {
            if (P) {
                try {
                    P.stop(0)
                } catch (e) {}
                P.disconnect()
            }
            Q = !1, w.clearRect(0, 0, J, K), $(A).hide()
        }

        function d(e) {
            s();
            var n = e.dataTransfer.files,
                t = new FileReader;
            t.onload = function(e) {
                var n = e.target.result;
                u(n)
            }, t.readAsArrayBuffer(n[0])
        }

        function u(e) {
            events.emit("sound-selected"), V.decodeAudioData ? V.decodeAudioData(e, function(e) {
                M = e, r()
            }, function(e) {
                console.log(e)
            }) : (M = V.createBuffer(e, !1), r())
        }

        function c() {
            s(), navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia, navigator.getUserMedia ? navigator.getUserMedia({
                audio: !0
            }, function(e) {
                F = V.createMediaStreamSource(e), F.connect(U), Q = !0, events.emit("sound-selected")
            }, function(e) {
                console.log("getMicInput error occured: " + e)
            }) : console.log("getMicInput. Could not getUserMedia")
        }

        function m() {
            events.emit("beat")
        }

        function v() {
            if (Q) {
                var e, n, t;
                for (U.getByteFrequencyData(y), U.getByteTimeDomainData(z), e = 0; b > e; e++) N[e] = (z[e] - 128) / 128 * I.gain;
                for (e = 0; L > e; e++) {
                    for (t = 0, n = 0; S > n; n++) t += y[e * S + n];
                    k[e] = t / S / 256 * I.gain, k[e] *= 1 + e / (4 * L), k[e] = ATUtil.clamp(k[e], 0, 1), R[3 * e] = 255 * k[e]
                }
                for (E.needsUpdate = !0, t = 0, n = 0; L > n; n++) t += k[n];
                j = t / L, O += (j - O) / 5, _.unshift(j), _.pop(), X.unshift(O), X.pop(), j > Y && j > I.beatThreshold ? (m(), Y = 1.1 * j, ee = 0) : ee <= I.beatHoldTime ? ee++ : (Y *= I.beatDecayRate, Y = Math.max(Y, I.beatThreshold)), I.drawAudio && f()
            }
        }

        function f() {
            w.clearRect(0, 0, J, K), 1 > ee && (w.fillStyle = "#FFF", w.fillRect(0, 0, J, K));
            var e = W / L;
            w.fillStyle = C;
            for (var n = 0; L > n; n++) w.fillRect(n * e, K, e - Z, -k[n] * K);
            for (w.fillStyle = C, w.fillRect(W, K, q, -j * K), w.beginPath(), w.moveTo(W, K - Y * K), w.lineTo(W + q, K - Y * K), w.stroke(), w.beginPath(), n = 0; b > n; n++) w.lineTo(n / b * W, N[n] * K / 2 + K / 2);
            w.stroke()
        }

        function g(e) {
            U.smoothingTimeConstant = e
        }

        function p() {
            var e = A.currentTime / A.duration;
            return isNaN(e) ? 0 : e
        }

        function h(e) {
            I.useAudioElement ? A.playbackRate = e : P.playbackRate.value = e
        }

        function H() {
            ConfigHandler.getConfig().useMic ? c() : (F.disconnect(U), s())
        }

        function T(e) {
            switch (e.id) {
                case 41:
                    AudioHandler.audioParams.gain = ATUtil.lerp(e.val, 0, 10)
            }
        }

        function x() {
            return I.useAudioElement ? A.currentTime : (Date.now() - B) / 1e3 % SequenceHandler.getDuration()
        }
        var E, y, z, b, S, R, w, C, P, M, V, U, D, A, F, B, I = {
                gain: .9,
                beatHoldTime: 50,
                beatThreshold: .05,
                beatDecayRate: .97,
                smoothing: .5,
                drawAudio: !0,
                useAudioElement: !1
            },
            N = [],
            k = [],
            j = 0,
            O = 0,
            _ = [],
            X = [],
            G = 256,
            L = 64,
            W = 220,
            q = 30,
            K = 100,
            J = W + q,
            Z = 2,
            Q = !1,
            Y = 0,
            ee = 0;
        return {
            update: v,
            init: e,
            getLevelsData: function() {
                return k
            },
            getLevelsTexture: function() {
                return E
            },
            levelsCount: L,
            getVolumeHistory: function() {
                return _
            },
            getSmoothedVolumeHistory: function() {
                return X
            },
            getWaveData: function() {
                return N
            },
            getVolume: function() {
                return j
            },
            getSmoothedVolume: function() {
                return O
            },
            setSmoothing: g,
            mute: l,
            getAudioTime: x,
            audioParams: I,
            setPlaybackRate: h,
            getProgress: p,
            loadAudioElement: i,
            onMP3Drop: d,
            play: t,
            onUseMic: H,
            getMicInput: c,
            doAutoPlay: n
        }
    }(),
    BPMHandler = function() {
        function e() {
            events.on("update", o);
            var e = document.getElementById("bpm-display");
            s = e.getContext("2d"), n(ConfigHandler.getConfig().BPM)
        }

        function n(e) {
            u = 6e4 / e, clearInterval(l), l = setInterval(t, u), $("#bpm-text").text("BPM: " + e)
        }

        function t() {
            events.emit("bpm-beat"), r = (new Date).getTime()
        }

        function o() {
            d = ((new Date).getTime() - r) / u, i()
        }

        function i() {
            var e = f - d * f;
            s.fillStyle = "#030", s.fillRect(0, 0, f, f), s.fillStyle = "#0D0", s.fillRect((f - e) / 2, (f - e) / 2, e, e)
        }

        function a() {
            clearInterval(l);
            var e = new Date,
                o = e.getTime();
            if (o - v > 2e3 && (c = 0), 0 === c) m = o, c = 1;
            else {
                var i = 6e4 * c / (o - m);
                i = Math.round(100 * i / 100), n(i), t(), c++
            }
            v = o
        }
        var r, l, s, d = 0,
            u = 500,
            c = 0,
            m = 0,
            v = 0,
            f = 30;
        return {
            update: o,
            init: e,
            onBPMTap: a,
            getBPMTime: function() {
                return isNaN(d) ? .001 : d
            },
            getBPMDuration: function() {
                return u
            },
            setBPM: n,
            onBPMBeat: t
        }
    }(),
    ConfigHandler = function() {
        function e() {
            var e = UberVizMain.getURLParamByName("config");
            e || (e = "default");
            var t = "config/" + e + ".json";
            $.ajax({
                type: "GET",
                dataType: "json",
                url: t,
                success: n,
                error: function(e, n, t) {
                    console.log("CONFIG ERROR: " + e.status), console.log(t)
                }
            })
        }

        function n(e) {
            t = e.config, events.emit("config-loaded")
        }
        var t;
        return {
            init: e,
            getConfig: function() {
                return t
            }
        }
    }(),
    ControlsHandler = function() {
        function e() {
            a = new dat.GUI({
                autoPlace: !1
            }), $("#controls").append(a.domElement), a.add(s, "autoMode").name("AUTOMATIC");
            var e = a.addFolder("AUDIO =============");
            e.add(ConfigHandler.getConfig(), "useMic").listen().onChange(AudioHandler.onUseMic).name("Use Mic"), e.add(AudioHandler.audioParams, "gain", 0, 6).step(.1).listen().name("Gain"), e.add(AudioHandler.audioParams, "beatHoldTime", 0, 100).listen().step(1).name("Beat Hold"), e.add(AudioHandler.audioParams, "beatThreshold", 0, 1).listen().step(.01).name("Beat Threshold"), e.add(AudioHandler.audioParams, "beatDecayRate", .9, 1).step(.01).name("Beat Decay"), e.add(AudioHandler.audioParams, "smoothing", 0, 1).step(.01).name("Smoothing").onChange(AudioHandler.setSmoothing), r = a.addFolder("VIZ ==============="), l = a.addFolder("FX ================"), $("#controls-holder").toggle(ConfigHandler.getConfig().showControls), $(document).on("drop", t), $(document).on("dragover", n), $(window).on("keydown", o)
        }

        function n(e) {
            return $("#sound-options").hide(), $("#prompt").show(), $("#prompt").html("Drop MP3 here"), e.stopPropagation(), e.preventDefault(), !1
        }

        function t(e) {
            ImageRipple.limitImages(), e.stopPropagation(), e.preventDefault(), AudioHandler.onMP3Drop(e.originalEvent)
        }

        function o(e) {
            switch (e.keyCode) {
                case 87:
                    BPMHandler.onBPMTap();
                    break;
                case 81:
                    ControlsHandler.toggleControls();
                    break;
                case 70:
            }
        }

        function i() {
            ConfigHandler.getConfig().showControls = !ConfigHandler.getConfig().showControls, $("#controls-holder").toggle(), VizHandler.onResize()
        }
        var a, r, l, s = {
            autoMode: !0
        };
        return {
            init: e,
            toggleControls: i,
            getGui: function() {
                return a
            },
            getVizFolder: function() {
                return r
            },
            getFXFolder: function() {
                return l
            },
            getControlParams: function() {
                return s
            }
        }
    }(),
    FXHandler = function() {
        function e() {
            m = new THREE.RenderPass(VizHandler.getScene(), VizHandler.getCamera()), v = new THREE.ShaderPass(THREE.CopyShader), u = {}, u.colorify = new THREE.ShaderPass(THREE.ColorifyShader), u.rgb = new THREE.ShaderPass(THREE.RGBShiftShader), u.mirror = new THREE.ShaderPass(THREE.MirrorShader), u.dotscreen = new THREE.DotScreenPass(new THREE.Vector2(0, 0), .5, .8), u.lines = new THREE.ShaderPass(THREE.LinesShader), u["super"] = new THREE.ShaderPass(THREE.SuperShader), u.wobble = new THREE.ShaderPass(THREE.WobbleShader), u.barrelBlur = new THREE.ShaderPass(THREE.BarrelBlurShader), u.shake = new THREE.ShaderPass(THREE.ShakeShader), u.brightness = new THREE.ShaderPass(THREE.BrightnessContrastShader), u["super"].uniforms.brightness.value = -1, $.ajax({
                type: "GET",
                dataType: "json",
                url: "config/" + ConfigHandler.getConfig().fxFileName,
                success: n
            })
        }

        function n(e) {
            d = e.filters;
            var n = ControlsHandler.getFXFolder();
            $.each(d, function(e, t) {
                n.add(t, "on").listen().name("" + t.displayName).onChange(l), $.each(t.params, function(e, t) {
                    if (t.value === !0 || t.value === !1) n.add(t, "value").listen().name("-- " + t.displayName).onChange(a);
                    else {
                        n.add(t, "value", t.min, t.max).listen().step(t.step).name("-- " + t.displayName).onChange(a), t.noisePosn = 9999 * Math.random();
                        var o;
                        "high" === t.randRange ? (o = t.max - t.min, t.randMin = t.min + .75 * o, t.randMax = t.max) : "low" === t.randRange ? (o = t.max - t.min, t.randMin = t.min, t.randMax = t.min + .4 * o) : (t.randMin = t.min, t.randMax = t.max)
                    }
                })
            }), n.add(f, "audioFade", 0, 1).listen().name("Audio Fade"), n.add(f, "strobe").listen().name("Strobe"), n.add(f, "strobePeriod", 4, 100).name("Strobe Time"), n.add(f, "tiltSpeed", 0, .6).name("Tilt Speed").listen(), n.add(f, "tiltAmount", 0, .6).name("Tilt Amount").listen(), n.add(FXHandler, "randomizeFilters").name("Randomize"), l(), a(), events.on("update", i), events.on("beat", o), events.on("viz-start", t), events.emit("init-complete"), TweenMax.fromTo(u["super"].uniforms.brightness, 2, {
                value: -1
            }, {
                value: 0
            })
        }

        function t() {
            TweenMax.fromTo(u["super"].uniforms.brightness, 1, {
                value: -1
            }, {
                value: 0
            })
        }

        function o() {
            if (ControlsHandler.getControlParams().autoMode) {
                if (ConfigHandler.getConfig().useSequence) {
                    if (Math.random() < .2 && d.mirror.params.auto.value && (u.mirror.uniforms.side.value = ATUtil.randomInt(0, 4)), d.wobble.on = !1, d.colorify.on = !1, d.dotscreen.on = !1, Math.random() < .3) {
                        var e = Math.random();
                        .33 > e ? d.wobble.on = !0 : .66 > e ? d.colorify.on = !0 : 1 > e && (d.dotscreen.on = !0)
                    }
                    return void l()
                }
                if (!(Math.random() < .5)) {
                    if (Math.random() < .1 ? (d.mirror.on = !0, d.mirror.params.auto.value && (u.mirror.uniforms.side.value = ATUtil.randomInt(0, 4))) : d.mirror.on = !1, f.strobe = !1, f.audioFade = 0, d.wobble.on = !1, d.colorify.on = !1, d.dotscreen.on = !1, Math.random() < .25) {
                        var e = Math.random();
                        .2 > e ? d.wobble.on = !0 : .4 > e ? f.strobe = !0 : .6 > e ? d.colorify.on = !0 : .8 > e ? d.dotscreen.on = !0 : f.audioFade = .6
                    }
                    l()
                }
            }
        }

        function i() {
            g += .1, u.wobble.uniforms.time.value = g, u.barrelBlur.uniforms.time.value = g, u.shake.uniforms.time.value = g, u.barrelBlur.uniforms.amount.value = AudioHandler.getSmoothedVolume() * d.barrelBlur.params.amount.value, u.shake.uniforms.amount.value = Math.pow(AudioHandler.getSmoothedVolume(), 4) * d.shake.params.amount.value, u.rgb.uniforms.angle.value = 6.28 * (simplexNoise.noise(g / 40, 99, 0) + .5), u["super"].uniforms.hue.value = 2 * simplexNoise.noise(g / 20, 999, 0);
            var e = new THREE.Color;
            e.setHSL(g / 10 % 2 / 2, 1, .5), u.colorify.uniforms.color.value = e;
            var n = -(1 - 2 * AudioHandler.getVolume()) * f.audioFade;
            n = Math.min(n, 0), f.strobe && (n -= 10 * g % f.strobePeriod / f.strobePeriod), u.brightness.uniforms.brightness.value = n, c.render(.1)
        }

        function a() {
            u.mirror.uniforms.additive.value = d.mirror.params.additive.value ? 1 : 0, $.each(d, function(e, n) {
                $.each(n.params, function(n, t) {
                    return t.custom ? !0 : void(u[e].uniforms[n].value = t.value)
                })
            }), r()
        }

        function r() {
            c && (c.setSize(VizHandler.getVizWidth(), VizHandler.getVizHeight()), u.lines.uniforms.amount.value = 2 * VizHandler.getVizWidth())
        }

        function l() {
            c = new THREE.EffectComposer(VizHandler.getRenderer()), c.addPass(m), $.each(d, function(e, n) {
                n.on && c.addPass(u[e])
            }), c.addPass(u.brightness), c.addPass(v), v.renderToScreen = !0, a(), r()
        }

        function s() {
            $.each(d, function(e, n) {
                n.on = !1
            });
            for (var e = Object.keys(d), n = e.length, t = 0; 3 > t; t++) {
                var o = ATUtil.randomInt(0, n - 1);
                d[e[o]].on = !0
            }
            l(), a()
        }
        var d, u, c, m, v, f = {
                tiltAmount: .1,
                tiltSpeed: .15,
                jumpOnBeat: !0,
                audioFade: 0,
                strobe: !1,
                strobePeriod: 6
            },
            g = 0;
        return {
            init: e,
            update: i,
            onBeat: o,
            resize: r,
            fxParams: f,
            randomizeFilters: s,
            filters: d,
            getFilters: function() {
                return d
            },
            onToggleShaders: l
        }
    }(),
    IntroHandler = function() {
        function e() {
            events.on("sound-selected", i), ConfigHandler.getConfig().showIntro && $("#intro").hide().fadeIn(1e3), $("#option-mic").click(t), $("#option-sample").click(o), $(".btn").click(n), $("#info").click(function() {})
        }

        function n() {
            "none" === $("#info").css("display") ? ($("#intro").hide(), $("#info").hide().fadeIn(500), $(".info-btn").hide(), $(".close-btn").show()) : ($("#info").hide(), $(".info-btn").show(), $(".close-btn").hide(), a && $("#intro").fadeIn(500))
        }

        function t() {
            $("#sound-options").hide(), $("#prompt").show(), $("#prompt").html("Enable Microphone Input"), ImageRipple.limitImages(), ConfigHandler.getConfig().useMic = !0, AudioHandler.getMicInput()
        }

        function o() {
            ConfigHandler.getConfig().useSequence = !0, i(), BPMHandler.setBPM(82.01), AudioHandler.doAutoPlay(), events.emit("sequence-start")
        }

        function i() {
            $("#intro").hide(), a = !1, events.emit("viz-start")
        }
        var a = !0;
        return {
            init: e
        }
    }(),
    events = new Events,
    simplexNoise = new SimplexNoise,
    VERSION = "0.9.7",
    UberVizMain = function() {
        function e() {
            return d = !!("ontouchstart" in window), window.location.href.indexOf("mobile") > -1 && (d = !0), console.log("ÜberViz v" + VERSION), a("ÜberViz v" + VERSION), $(window).on("resize", i), r() ? (navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia, navigator.getUserMedia ? (document.onselectstart = function() {
                return !1
            }, s = new Stats, $("#controls-holder").prepend(s.domElement), s.domElement.id = "stats", events.on("config-loaded", t), ConfigHandler.init(), $("#preloader").hide(), void(d && $("body").click(function() {
                $("body")[0].webkitRequestFullscreen()
            }))) : void n("This browser does not support Mic input.<br>Please use Chrome or Firefox.")) : void n("This browser does not support WebGL.<br>Please use Chrome or Firefox.")
        }

        function n(e) {
            $(".info-btn").hide(), $("#preloader").hide(), $("#intro").fadeIn(300), $("#sound-options").hide(), $("#prompt").show(), $("#prompt").html(e), window.addEventListener("resize", i, !1), i()
        }

        function t() {
            BPMHandler.init(), AudioHandler.init(), ControlsHandler.init(), VizHandler.init(), FXHandler.init(), IntroHandler.init(), SequenceHandler.init(), i(), o()
        }

        function o() {
            requestAnimationFrame(o), s.update(), events.emit("update")
        }

        function i() {
            VizHandler.onResize()
        }

        function a(e) {
            $("#debug-text").text(e)
        }

        function r() {
            try {
                return !!window.WebGLRenderingContext && !!document.createElement("canvas").getContext("experimental-webgl")
            } catch (e) {
                return !1
            }
        }

        function l(e) {
            e = e.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var n = new RegExp("[\\?&]" + e + "=([^&#]*)"),
                t = n.exec(location.search);
            return null === t ? "" : decodeURIComponent(t[1].replace(/\+/g, " "))
        }
        var s, d;
        return {
            init: e,
            trace: a,
            hasWebGL: r,
            getURLParamByName: l,
            getIsMobile: function() {
                return d
            }
        }
    }();
$(document).ready(function() {
    UberVizMain.init()
});
var Sequence = function() {
        function e() {
            events.on("sequence-event", n)
        }

        function n(e) {
            for (var n = 0; 6 > n; n++) VizHandler.getActiveViz()[n].getVizParams().on = !1, VizHandler.getActiveViz()[n].onToggleViz();
            switch (e) {
                case "0 Build":
                    AudioHandler.audioParams.gain = 1.5, AudioHandler.audioParams.beatHoldTime = 80, ColorWheel.getVizParams().on = !0, ColorWheel.onToggleViz(), Eclipse.getVizParams().on = !0, Eclipse.onToggleViz(), StarBars.getVizParams().on = !1, StarBars.onToggleViz(), FXHandler.getFilters().mirror.on = !1, FXHandler.getFilters().mirror.params.additive.value = !1, FXHandler.fxParams.audioFade = 0, FXHandler.onToggleShaders(), ImageRipple.getVizParams().autoHide = !1, ImageRipple.getVizParams().freak = !1, FXHandler.fxParams.strobe = !1;
                    break;
                case "0.5 Build2":
                    AudioHandler.audioParams.gain = 1.5, AudioHandler.audioParams.beatHoldTime = 80, ColorWheel.getVizParams().on = !0, ColorWheel.onToggleViz(), Eclipse.getVizParams().on = !0, Eclipse.onToggleViz(), FXHandler.getFilters().mirror.on = !0, FXHandler.getFilters().mirror.params.additive.value = !0, FXHandler.fxParams.audioFade = 0, FXHandler.onToggleShaders(), ImageRipple.getVizParams().autoHide = !1, FXHandler.fxParams.strobe = !1;
                    break;
                case "1 Drums":
                    AudioHandler.audioParams.gain = .9, AudioHandler.audioParams.beatHoldTime = 10, Eclipse.getVizParams().on = !0, Eclipse.onToggleViz(), ImageRipple.getVizParams().on = !0, ImageRipple.onToggleViz(), Ripples.getVizParams().on = !0, Ripples.onToggleViz(), FXHandler.getFilters().mirror.on = !1, FXHandler.getFilters().mirror.params.additive.value = !1, FXHandler.fxParams.audioFade = 1, FXHandler.onToggleShaders();
                    break;
                case "2 Beats":
                    AudioHandler.audioParams.gain = .9, AudioHandler.audioParams.beatHoldTime = 30, ColorWheel.getVizParams().on = !0, ColorWheel.onToggleViz(), Eclipse.getVizParams().on = !0, Eclipse.onToggleViz(), Crystal.getVizParams().on = !0, Crystal.onToggleViz(), StarBars.getVizParams().on = !0, StarBars.onToggleViz(), FXHandler.fxParams.audioFade = 0, FXHandler.getFilters().mirror.on = !0, FXHandler.onToggleShaders();
                    break;
                case "3 Break":
                    AudioHandler.audioParams.gain = 2, AudioHandler.audioParams.beatHoldTime = 10, Ripples.getVizParams().on = !0, Ripples.onToggleViz(), Eclipse.getVizParams().on = !0, Eclipse.onToggleViz(), StarBars.getVizParams().on = !1, StarBars.onToggleViz(), FXHandler.fxParams.strobe = !0, FXHandler.fxParams.strobePeriod = 6, FXHandler.getFilters().mirror.on = !0, FXHandler.onToggleShaders();
                    break;
                case "4 Build":
                    AudioHandler.audioParams.gain = .9, AudioHandler.audioParams.beatHoldTime = 30, ColorWheel.getVizParams().on = !0, ColorWheel.onToggleViz(), Crystal.getVizParams().on = !0, Crystal.onToggleViz(), ImageTunnel.getVizParams().on = !0, ImageTunnel.onToggleViz(), StarBars.getVizParams().on = !0, StarBars.onToggleViz(), TweenMax.fromTo(ImageTunnel.vizParams, 23, {
                        opacity: 0
                    }, {
                        opacity: .5,
                        onUpdate: ImageTunnel.onParamsChange
                    }), FXHandler.fxParams.strobe = !1, FXHandler.fxParams.audioFade = 0, FXHandler.onToggleShaders();
                    break;
                case "5 Beats":
                    AudioHandler.audioParams.gain = .9, Ripples.getVizParams().on = !0, Ripples.onToggleViz(), ImageRipple.getVizParams().on = !0, ImageRipple.getVizParams().freak = !0, ImageRipple.getVizParams().autoHide = !0, ImageRipple.onToggleViz(), ColorWheel.getVizParams().on = !0, ColorWheel.onToggleViz(), FXHandler.fxParams.strobe = !0, FXHandler.fxParams.strobePeriod = 22, FXHandler.getFilters().mirror.on = !1, FXHandler.onToggleShaders()
            }
        }
        var t = [{
                bars: 0,
                name: "0 Build"
            }, {
                bars: 4,
                name: "0.5 Build2"
            }, {
                bars: 8,
                name: "1 Drums"
            }, {
                bars: 12,
                name: "2 Beats"
            }, {
                bars: 20,
                name: "3 Break"
            }, {
                bars: 24,
                name: "4 Build"
            }, {
                bars: 32,
                name: "5 Beats"
            }],
            o = 120.6,
            i = 2.926;
        return {
            sequenceData: t,
            barTime: i,
            duration: o,
            init: e
        }
    }(),
    sequence, SequenceHandler = function() {
        function e() {
            Sequence.init(), events.on("sequence-start", n), i = 0
        }

        function n() {
            events.on("update", t)
        }

        function t() {
            var e = AudioHandler.getAudioTime();
            if (o > e) return i = 0, o = 0, void events.emit("sequence-reset");
            if (a[i]) {
                var n = a[i];
                n.bars * Sequence.barTime < e && (events.emit("sequence-event", n.name), i++)
            }
            o = e
        }
        var o, i, a = Sequence.sequenceData,
            r = Sequence.duration;
        return {
            init: e,
            update: t,
            getSequence: function() {
                return sequence
            },
            getDuration: function() {
                return r
            }
        }
    }(),
    VizHandler = function() {
        function e() {
            if (f = [ColorWheel, Crystal, ImageRipple, ImageTunnel, Eclipse, Ripples, StarBars, Stars, LightLeak], events.on("update", n), events.on("beat", t), events.on("viz-start", i), d = new THREE.WebGLRenderer({
                    maxLights: 0
                }), d.setSize(800, 600), d.setClearColor(0), d.sortObjects = !1, $("#webgl").append(d.domElement), l = new THREE.PerspectiveCamera(70, ConfigHandler.getConfig().displayWidth / ConfigHandler.getConfig().displayHeight, 1, 4e3), l.position.z = 1e3, s = new THREE.Scene, s.add(l), s.fog = new THREE.Fog(0, 0, 2e3), u = new THREE.Object3D, s.add(u), u.sortObjects = !1, c = new THREE.Object3D, u.add(c), c.sortObjects = !1, ConfigHandler.getConfig().showDebug) {
                var e = new THREE.Object3D;
                u.add(e);
                var o = new THREE.BoxGeometry(1e3, 1e3, 1e3),
                    a = new THREE.MeshBasicMaterial({
                        color: 16711680,
                        wireframe: !0
                    }),
                    m = new THREE.Mesh(o, a);
                e.add(m), m = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshBasicMaterial({
                    color: 16711680,
                    wireframe: !0
                })), e.add(m), m = new THREE.Mesh(new THREE.PlaneGeometry(800 * 2.3, 1380, 5, 5), new THREE.MeshBasicMaterial({
                    color: 65280,
                    wireframe: !0
                })), e.add(m), m = new THREE.Mesh(new THREE.PlaneGeometry(800 * 2.3, 1380, 5, 5), new THREE.MeshBasicMaterial({
                    color: 255,
                    wireframe: !0
                })), m.rotation.x = Math.PI / 2, e.add(m)
            }
            r();
            for (var v = f.length, p = 0; v > p; p++) f[p].init();
            g = 100 * Math.random()
        }

        function n() {
            g += .01, ControlsHandler.getControlParams().autoMode && (FXHandler.fxParams.tiltAmount = (simplexNoise.noise(g / 20, 99, 0) + 1) / 2 * .25, FXHandler.fxParams.tiltSpeed = (simplexNoise.noise(g / 20, 9999, 0) + 1) / 2 * .25);
            var e = Math.PI * FXHandler.fxParams.tiltAmount;
            p += .01 * FXHandler.fxParams.tiltSpeed, c.rotation.x = simplexNoise.noise(p, 0) * e / 4, c.rotation.y = simplexNoise.noise(p, 100) * e, c.rotation.z = simplexNoise.noise(p, 200) * e
        }

        function t() {
            FXHandler.fxParams.jumpOnBeat && Math.random() < .3 && a(), Math.random() < .8 && o()
        }

        function o() {
            if (ControlsHandler.getControlParams().autoMode && !ConfigHandler.getConfig().useSequence) {
                var e = f.slice(0, 6);
                e = ATUtil.shuffle(e);
                for (var n = 0; 6 > n; n++) {
                    var t = 2 > n;
                    e[n].getVizParams().on = t, e[n].onToggleViz()
                }
            }
        }

        function i() {
            f[8].getVizParams().on = !1, f[8].onToggleViz(), o()
        }

        function a() {
            p = 20 * Math.random()
        }

        function r() {
            ConfigHandler.getConfig().fullSize ? (m = window.innerWidth, v = window.innerHeight, ConfigHandler.getConfig().showControls && (m -= 262), $("#viz").css({
                top: 0
            }), $("#viz").css({
                left: 0
            })) : (m = ConfigHandler.getConfig().displayWidth, v = ConfigHandler.getConfig().displayHeight), $("#viz").css({
                width: m + "px"
            }), $("#viz").css({
                height: v + "px"
            }), l.aspect = m / v, l.updateProjectionMatrix(), d.setSize(m, v), FXHandler.resize()
        }
        var l, s, d, u, c, m, v, f, g = 0,
            p = 0;
        return {
            init: e,
            update: n,
            onBeat: t,
            doJump: a,
            getVizHolder: function() {
                return u
            },
            getVizTumbler: function() {
                return c
            },
            getCamera: function() {
                return l
            },
            getScene: function() {
                return s
            },
            getRenderer: function() {
                return d
            },
            onResize: r,
            getNoiseTime: function() {
                return g
            },
            getVizWidth: function() {
                return m
            },
            getVizHeight: function() {
                return v
            },
            getActiveViz: function() {
                return f
            },
            randomizeViz: o
        }
    }();
THREE.AdditiveBlendShader = {
    uniforms: {
        tBase: {
            type: "t",
            value: null
        },
        tAdd: {
            type: "t",
            value: null
        },
        amount: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tBase;", "uniform sampler2D tAdd;", "uniform float amount;", "varying vec2 vUv;", "void main() {", "vec4 texel1 = texture2D( tBase, vUv );", "vec4 texel2 = texture2D( tAdd, vUv );", "gl_FragColor = texel1 + texel2 * amount;", "}"].join("\n")
}, THREE.BarrelBlurShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        amount: {
            type: "f",
            value: .5
        },
        time: {
            type: "f",
            value: 0
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float amount;", "uniform float time;", "varying vec2 vUv;", "const int num_iter = 16;", "const float reci_num_iter_f = 1.0 / float(num_iter);", "const float gamma = 2.2;", "const float MAX_DIST_PX = 200.0;", "vec2 barrelDistortion( vec2 p, vec2 amt )", "{", "    p = 2.0*p-1.0;", "    //float BarrelPower = 1.125;", "    const float maxBarrelPower = 3.0;", "    float theta  = atan(p.y, p.x);", "    float radius = length(p);", "    radius = pow(radius, 1.0 + maxBarrelPower * amt.x);", "    p.x = radius * cos(theta);", "    p.y = radius * sin(theta);", "    return 0.5 * ( p + 1.0 );", "}", "float sat( float t )", "{", "	return clamp( t, 0.0, 1.0 );", "}", "float linterp( float t ) {", "	return sat( 1.0 - abs( 2.0*t - 1.0 ) );", "}", "float remap( float t, float a, float b ) {", "	return sat( (t - a) / (b - a) );", "}", "vec3 spectrum_offset( float t ) {", "	vec3 ret;", "	float lo = step(t,0.5);", "	float hi = 1.0-lo;", "	float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );", "	ret = vec3(lo,1.0,hi) * vec3(1.0-w, w, 1.0-w);", "", "	return pow( ret, vec3(1.0/2.2) );", "}", "float nrand( vec2 n )", "{", "	return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);", "}", "vec3 lin2srgb( vec3 c )", "{", "    return pow( c, vec3(gamma) );", "}", "vec3 srgb2lin( vec3 c )", "{", "    return pow( c, vec3(1.0/gamma));", "}", "void main() {", "vec2 uv = vUv;", "vec2 max_distort = vec2(amount);", "vec2 oversiz = barrelDistortion( vec2(1,1), max_distort );", "uv = 2.0 * uv - 1.0;", "uv = uv / (oversiz*oversiz);", "uv = 0.5 * uv + 0.5;", "vec3 sumcol = vec3(0.0);", "vec3 sumw = vec3(0.0);", "float rnd = nrand( uv + fract(time) );", "for ( int i=0; i<num_iter;++i ){", "float t = (float(i)+rnd) * reci_num_iter_f;", "vec3 w = spectrum_offset( t );", "sumw += w;", "sumcol += w * srgb2lin(texture2D( tDiffuse, barrelDistortion(uv, max_distort*t ) ).rgb);", "}", "sumcol.rgb /= sumw;", "vec3 outcol = lin2srgb(sumcol.rgb);", "outcol += rnd/255.0;", "gl_FragColor = vec4( outcol, 1.0);", "}"].join("\n")
}, THREE.ColorShiftShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "float wave(float x, float amount) {", "return (sin(x * amount) + 1.) * .5;", "}", "void main() {", "vec4 color = texture2D(tDiffuse, vUv);", "gl_FragColor.r = wave(color.r, 10.);", "gl_FragColor.g = wave(color.g, 20.);", "gl_FragColor.b = wave(color.b, 40.);", "gl_FragColor.a = 1.;", "}"].join("\n")
}, THREE.LinesShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        amount: {
            type: "f",
            value: 1500
        },
        strength: {
            type: "f",
            value: .3
        },
        angle: {
            type: "f",
            value: .5
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float strength;", "uniform float amount;", "uniform float angle;", "varying vec2 vUv;", "void main() {", "vec4 col = texture2D(tDiffuse, vUv);", "col += sin(vUv.x*amount*(1.0-angle)+vUv.y*amount*angle)*strength;", "gl_FragColor = col;", "}"].join("\n")
}, THREE.MirrorShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        side: {
            type: "i",
            value: 1
        },
        additive: {
            type: "i",
            value: 0
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform int side;", "uniform int additive;", "varying vec2 vUv;", "void main() {", "vec2 p = vUv;", "vec4 color;", "if (additive == 1){", "color = texture2D(tDiffuse, vUv);", "if (side < 2){", "p.x = 1.0 - p.x;", "}else {", "p.y = 1.0 - p.y;", "}", "color += texture2D(tDiffuse, p);", "}else{", "if (side == 0){", "if (p.x > 0.5) p.x = 1.0 - p.x;", "}else if (side == 1){", "if (p.x < 0.5) p.x = 1.0 - p.x;", "}else if (side == 2){", "if (p.y < 0.5) p.y = 1.0 - p.y;", "}else if (side == 3){", "if (p.y > 0.5) p.y = 1.0 - p.y;", "} ", "color = texture2D(tDiffuse, p);", "}", "gl_FragColor = color;", "}"].join("\n")
}, THREE.ShakeShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        time: {
            type: "f",
            value: 0
        },
        amount: {
            type: "f",
            value: .05
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float time;", "uniform float amount;", "varying vec2 vUv;", "float rand(vec2 co){", "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);", "}", "void main() {", "vec2 p = vUv;", "vec2 offset = vec2((rand(vec2(time,time)) - 0.5)*amount,(rand(vec2(time + 999.0,time + 999.0))- 0.5) *amount);", "p += offset;", "gl_FragColor = texture2D(tDiffuse, p);", "}"].join("\n")
}, THREE.SuperShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        glowAmount: {
            type: "f",
            value: .5
        },
        glowSize: {
            type: "f",
            value: 4
        },
        resolution: {
            type: "v2",
            value: new THREE.Vector2(800, 600)
        },
        vigOffset: {
            type: "f",
            value: 1
        },
        vigDarkness: {
            type: "f",
            value: 1
        },
        brightness: {
            type: "f",
            value: 0
        },
        contrast: {
            type: "f",
            value: 0
        },
        hue: {
            type: "f",
            value: 0
        },
        saturation: {
            type: "f",
            value: 0
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float glowSize;", "uniform float glowAmount;", "uniform vec2 resolution;", "uniform float vigOffset;", "uniform float vigDarkness;", "uniform float brightness;", "uniform float contrast;", "uniform float hue;", "uniform float saturation;", "uniform int mirrorSide;", "varying vec2 vUv;", "void main() {", "float h = glowSize / resolution.x;", "float v = glowSize / resolution.y;", "vec4 sum = vec4( 0.0 );", "sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;", "sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;", "sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;", "sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;", "sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;", "sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;", "sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;", "sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;", "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;", "vec4 col = texture2D( tDiffuse, vUv );", "col = min(col + sum * glowAmount, 1.0);", "vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( vigOffset );", "col = vec4( mix( col.rgb, vec3( 1.0 - vigDarkness ), dot( uv, uv ) ), col.a );", "col.rgb += brightness;", "if (contrast > 0.0) {", "col.rgb = (col.rgb - 0.5) / (1.0 - contrast) + 0.5;", "} else {", "col.rgb = (col.rgb - 0.5) * (1.0 + contrast) + 0.5;", "}", "float angle = hue * 3.14159265;", "float s = sin(angle), c = cos(angle);", "vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;", "float len = length(col.rgb);", "col.rgb = vec3(", "dot(col.rgb, weights.xyz),", "dot(col.rgb, weights.zxy),", "dot(col.rgb, weights.yzx)", ");", "float average = (col.r + col.g + col.b) / 3.0;", "if (saturation > 0.0) {", "col.rgb += (average - col.rgb) * (1.0 - 1.0 / (1.001 - saturation));", "} else {", "col.rgb += (average - col.rgb) * (-saturation);", "}", "gl_FragColor = col;", "}"].join("\n")
}, THREE.WobbleShader = {
    uniforms: {
        tDiffuse: {
            type: "t",
            value: null
        },
        time: {
            type: "f",
            value: 0
        },
        strength: {
            type: "f",
            value: .001
        },
        size: {
            type: "f",
            value: 50
        },
        speed: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float time;", "uniform float strength;", "uniform float size;", "uniform float speed;", "varying vec2 vUv;", "void main() {", "vec2 p = -1.0 + 2.0 * vUv;", "gl_FragColor = texture2D(tDiffuse, vUv + strength * vec2(cos(time*speed+length(p*size)), sin(time*speed+length(p*size))));", "}"].join("\n")
};
var ColorWheel = function() {
        function e() {
            m = AudioHandler.levelsCount;
            var e = ControlsHandler.getVizFolder().addFolder("Wheel");
            e.add(c, "on").listen().onChange(n), e.add(c, "hueRange", 0, 1).step(.1), e.add(c, "opacity", 0, 1).step(.1).listen().onChange(t), c.on && e.open(), d = new THREE.Object3D, VizHandler.getVizHolder().add(d), l = new THREE.CircleGeometry(1e4, m, 0, 2 * Math.PI), s = new THREE.MeshBasicMaterial({
                vertexColors: THREE.FaceColors,
                transparent: !0,
                blending: THREE.AdditiveBlending,
                depthTest: !1
            }), u = new THREE.Mesh(l, s), u.rotation.z = Math.PI / 2 + 2 * Math.PI / 24, d.add(u), events.on("update", a), events.on("beat", r), events.on("bpm-beat", o), events.on("seeked", r), t(), n()
        }

        function n() {
            d.visible = c.on
        }

        function t() {
            s.opacity = c.opacity;
        }

        function o() {
            v += 1
        }

        function a() {
            for (i = 0; i < m; ++i) {
                var e = (i + v) / m % 1,
                    n = Math.floor(e * AudioHandler.levelsCount * .8),
                    o = AudioHandler.getLevelsData()[n],
                    a = 1.2 * o;
                a = Math.min(a * a, 1), l.faces[i].color.setHSL(c.hue + i / m * c.hueRange, 1, a)
            }
            l.colorsNeedUpdate = !0, d.rotation.z -= .005, ControlsHandler.getControlParams().autoMode && (c.hueRange = (simplexNoise.noise(VizHandler.getNoiseTime() / 10, 65) + 1) / 2, c.opacity = (simplexNoise.noise(VizHandler.getNoiseTime() / 10, 55) + 1) / 2 + .3, t())
        }

        function r() {
            Math.random() < .5 || (d.rotation.z += Math.random() * Math.PI * 2)
        }
        var l, s, d, u, c = {
                on: !1,
                hue: 0,
                hueRange: 1,
                opacity: .7,
                useTrackHue: !1
            },
            m = 64,
            v = 0;
        return {
            init: e,
            vizParams: c,
            onToggleViz: n,
            getVizParams: function() {
                return c
            },
            onToggleViz: n
        }
    }(),
    Crystal = function() {
        function e() {
            var e = ControlsHandler.getVizFolder().addFolder("Crystal");
            e.add(u, "on").listen().onChange(n), e.add(u, "freakout"), e.add(u, "scale", 0, 4).step(.1).name("Size").listen(), e.add(u, "opacity", 0, 1).step(.1).listen().onChange(t), u.on && e.open();
            var o = 300,
                i = new THREE.TetrahedronGeometry(o);
            s = new THREE.Object3D, VizHandler.getVizTumbler().add(s);
            for (var c = 0; d >= c; c++) {
                var m = new THREE.MeshBasicMaterial({
                        color: 16777215 * Math.random(),
                        blending: THREE.AdditiveBlending,
                        side: THREE.DoubleSide,
                        overdraw: !0,
                        opacity: ATUtil.randomRange(.1, .6),
                        transparent: !0
                    }),
                    v = new THREE.Mesh(i, m);
                v.scale.x = 2, s.add(v);
                var f = 100;
                v.restPosn = {}, v.restPosn.x = ATUtil.randomRange(-f, f), v.restPosn.y = ATUtil.randomRange(-f, f), v.restPosn.z = ATUtil.randomRange(-f, f), f = 600, v.maxPosn = {}, v.maxPosn.x = ATUtil.randomRange(-f, f), v.maxPosn.y = ATUtil.randomRange(-f, f), v.maxPosn.z = ATUtil.randomRange(-f, f)
            }
            events.on("update", a), events.on("beat", r), events.on("bpm-beat", l), t(), n()
        }

        function n(e) {
            s.visible = u.on
        }

        function t() {
            for (var e = 0; d >= e; e++) {
                var n = s.children[e];
                n.material.opacity = u.opacity * ATUtil.randomRange(.1, .6)
            }
        }

        function o() {
            var e = ATUtil.randomInt(0, d - 1),
                n = s.children[e],
                t = BPMHandler.getBPMDuration() / 1e3 * 2,
                o = Expo.easeIn;
            TweenMax.to(n.rotation, t, {
                x: Math.random() * Math.PI * 2,
                y: Math.random() * Math.PI * 2,
                z: Math.random() * Math.PI * 2,
                ease: o
            }), TweenMax.to(n.scale, t, {
                x: ATUtil.randomRange(.5, 3),
                y: ATUtil.randomRange(.5, 3),
                z: ATUtil.randomRange(.5, 3),
                ease: o
            }), TweenMax.set(n.material, {
                opacity: u.opacity
            }), TweenMax.to(n.material, t, {
                opacity: ATUtil.randomRange(.1, .6) * u.opacity,
                ease: o
            }), n.material.color.setHex(16777215 * Math.random())
        }

        function i() {
            s.rotation.x = Math.random() * Math.PI * 2, s.rotation.z = Math.random() * Math.PI * 2
        }

        function a() {
            s.rotation.z += .01, s.rotation.x += .01;
            var e = .2 + .6 * AudioHandler.getSmoothedVolume() * u.scale + .1 * AudioHandler.getVolume();
            if (s.scale.set(e, e, e), u.freakout)
                for (var n = Math.sin(BPMHandler.getBPMTime() * Math.PI), o = 0; d >= o; o++) {
                    var i = s.children[o];
                    i.material.color.setHex(16777215 * Math.random()), i.position.x = n * i.maxPosn.x, i.position.y = n * i.maxPosn.y, i.position.z = n * i.maxPosn.z
                } else
                    for (var o = 0; d >= o; o++) {
                        var i = s.children[o];
                        i.position.x = i.restPosn.x, i.position.y = i.restPosn.y, i.position.z = i.restPosn.z
                    }
            ControlsHandler.getControlParams().autoMode && (u.scale = ATUtil.lerp(simplexNoise.noise(VizHandler.getNoiseTime() / 10, 60) / 2 + .5, 1, 2.5), t())
        }

        function r() {
            o()
        }

        function l() {
            i()
        }
        var s, d = 4,
            u = {
                on: !1,
                scale: 1.6,
                freakout: !1,
                opacity: .7
            };
        return {
            init: e,
            update: a,
            onBeat: r,
            onBPMBeat: l,
            getVizParams: function() {
                return u
            },
            onToggleViz: n
        }
    }(),
    Eclipse = function() {
        function e() {
            var e = ControlsHandler.getVizFolder().addFolder("Eclipse");
            e.add(s, "on").listen().onChange(n), e.add(s, "radius", 0, .1).listen().onChange(t), e.add(s, "brightness", 0, .02).listen().onChange(t), s.on && e.open(), events.on("update", o), events.on("beat", i), events.on("bpm-beat", a), events.on("seeked", i), r = new THREE.Object3D, VizHandler.getVizHolder().add(r), l = new THREE.ShaderMaterial({
                uniforms: THREE.EclipseShader.uniforms,
                vertexShader: THREE.EclipseShader.vertexShader,
                fragmentShader: THREE.EclipseShader.fragmentShader,
                depthTest: !1,
                blending: THREE.AdditiveBlending,
                transparent: !0
            });
            var d = new THREE.PlaneGeometry(1200, 1200, 1, 1),
                u = new THREE.Mesh(d, l);
            r.add(u), u.z = 0, u.scale.x = u.scale.y = 4, t(), n()
        }

        function n() {
            r.visible = s.on
        }

        function t() {
            THREE.EclipseShader.uniforms.radius.value = s.radius, THREE.EclipseShader.uniforms.brightness.value = s.brightness, THREE.EclipseShader.uniforms.opacity.value = s.opacity
        }

        function o() {
            r.rotation.z += .002, THREE.EclipseShader.uniforms.time.value += .002, THREE.EclipseShader.uniforms.levelsTexture.value = AudioHandler.getLevelsTexture(), ControlsHandler.getControlParams().autoMode && (s.radius = (simplexNoise.noise(VizHandler.getNoiseTime() / 10, 0) + 1) / 2 * .05 + .06, s.brightness = (simplexNoise.noise(VizHandler.getNoiseTime() / 10, 5) + 1) / 2 * .01, t())
        }

        function i() {}

        function a() {}
        var r, l, s = {
            on: !1,
            radius: .07,
            brightness: .005,
            opacity: 1
        };
        return {
            init: e,
            getVizParams: function() {
                return s
            },
            onToggleViz: n
        }
    }(),
    ImageRipple = function() {
        function e() {
            events.on("midi", s);
            var e = ControlsHandler.getVizFolder().addFolder("Logo");
            e.add(x, "on").listen().onChange(n), e.add(x, "step"), e.add(x, "freak"), e.add(x, "strobe"), e.add(x, "size", 0, 2).name("Size"), e.add(x, "audioDepth", 0, 1e3).onChange(o), e.add(x, "numStrips", 1, 100).listen().onChange(o), x.on && e.open();
            for (var t = 0; v > t; t++) p[t] = THREE.ImageUtils.loadTexture(m + t + "." + f), p[t].minFilter = p[t].magFilter = THREE.LinearFilter;
            d = new THREE.Object3D, VizHandler.getVizTumbler().add(d), events.on("update", i), events.on("beat", a), events.on("bpm-beat", r), c = new THREE.ShaderMaterial({
                uniforms: THREE.ImageRippleShader.uniforms,
                vertexShader: THREE.ImageRippleShader.vertexShader,
                fragmentShader: THREE.ImageRippleShader.fragmentShader,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthTest: !1,
                transparent: !0
            }), c.uniforms.texture.value = p[0];
            var l = new THREE.PlaneGeometry(800, 600, 100, 100);
            u = new THREE.Mesh(l, c), d.add(u), u.z = 100, u.scale.x = u.scale.y = g, o(), n()
        }

        function n() {
            d.visible = x.on
        }

        function t() {
            h++, h %= v, c.uniforms.texture.value = p[h]
        }

        function o() {
            c.uniforms.numStrips.value = x.numStrips, c.uniforms.opacity.value = 1
        }

        function i() {
            c.uniforms.audioDepth.value = x.audioDepth, c.uniforms.levels.value = AudioHandler.getSmoothedVolumeHistory();
            var e = (AudioHandler.getSmoothedVolume() * AudioHandler.getSmoothedVolume() * 1.5 + .4) * x.size;
            d.scale.set(e, e, e), T += .6, T > 1 && (T = 0, x.freak && t(), x.strobe && (H = !H, c.uniforms.opacity.value = H ? 0 : 1))
        }

        function a() {
            if (t(), x.strobe = Math.random() < .2, o(), x.on && x.autoHide) {
                var e = Math.random() < .5;
                d.visible = e
            }
        }

        function r() {}

        function l() {
            v = 2, p[1] = p[4]
        }

        function s(e) {
            switch (e.id) {
                case 93:
                    t();
                    var n = 1.3 * g;
                    TweenMax.killTweensOf(c), TweenMax.killTweensOf(u.scale), c.opacity = 1, u.scale.set(n, n, n), TweenMax.to(u.scale, 1, {
                        x: g,
                        y: g,
                        z: g,
                        ease: Power2.easeIn
                    }), TweenMax.to(c, 1, {
                        opacity: 0,
                        ease: Power2.easeIn
                    })
            }
        }
        var d, u, c, m = "res/img/img-overlay/sbtrkt/",
            v = 6,
            f = "jpg",
            g = 3,
            p = [],
            h = 0,
            H = !0,
            T = 0,
            x = {
                on: !1,
                freak: !1,
                step: !0,
                size: .8,
                strobe: !1,
                autoHide: !1,
                audioDepth: 900,
                numStrips: 30
            };
        return {
            init: e,
            getVizParams: function() {
                return x
            },
            onToggleViz: n,
            limitImages: l
        }
    }(),
    ImageTunnel = function() {
        function e() {
            events.on("midi", l);
            var e = ControlsHandler.getVizFolder().addFolder("Tunnel");
            e.add(g, "on").listen().onChange(n), e.add(g, "step"), e.add(g, "twist", 0, .2).name("twist").onChange(t), e.add(g, "rings", 1, 24).name("rings").step(1).onChange(t), e.add(g, "opacity", 0, 1).step(.01).listen().onChange(t), g.on && e.open();
            for (var i = 0; f > i; i++) p[i] = THREE.ImageUtils.loadTexture(c + m + i + "." + v), p[i].minFilter = p[i].magFilter = THREE.LinearFilter;
            events.on("update", o), events.on("beat", a), events.on("bpm-beat", r), d = new THREE.Object3D, VizHandler.getVizHolder().add(d), s = new THREE.Object3D, d.add(s);
            var H = new THREE.PlaneGeometry(800, 800, 1, 1);
            u = new THREE.MeshBasicMaterial({
                map: p[0],
                transparent: !0,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthTest: !1,
                depthWrite: !1,
                fog: !0
            });
            for (var i = 0; h > i; i++) {
                var T = new THREE.Mesh(H, u);
                s.add(T)
            }
            t(), n()
        }

        function n() {
            d.visible = g.on
        }

        function t() {
            for (var e = 0; h > e; e++) e < g.rings ? (s.children[e].rotation.z = e * g.twist, s.children[e].position.z = e / g.rings * H, s.children[e].visible = !0) : s.children[e].visible = !1;
            u.opacity = g.opacity
        }

        function o() {
            s.position.z = BPMHandler.getBPMTime() * H / g.rings - H / 2, s.rotation.z += .002
        }

        function i() {
            T++, T %= f, u.map = p[T]
        }

        function a() {
            Math.random() < .2 && g.step && i(), Math.random() < .2 && ControlsHandler.getControlParams().autoMode && (g.rings = ATUtil.randomInt(8, 16), t())
        }

        function r() {}

        function l(e) {
            switch (e.id) {
                case 83:
                    i();
                    break;
                case 84:
                    g.opacity = e.val, t()
            }
        }
        var s, d, u, c = "res/img/tunnel/",
            m = "",
            v = "jpg",
            f = 3,
            g = {
                on: !1,
                twist: 0,
                step: !0,
                opacity: 0,
                rings: 12
            },
            p = [],
            h = 24,
            H = 2e3,
            T = 0;
        return {
            init: e,
            getVizParams: function() {
                return g
            },
            onToggleViz: n,
            onParamsChange: t,
            vizParams: g
        }
    }(),
    LightLeak = function() {
        function e() {
            events.on("midi-control", r);
            var e = ControlsHandler.getVizFolder().addFolder("Light Leak");
            e.add(v, "on").listen().onChange(n), e.add(v, "opacity", 0, 1).name("Opacity"), e.add(v, "freakOut"), v.on && e.open(), l = new THREE.Object3D, VizHandler.getScene().add(l), events.on("update", o), events.on("beat", i), events.on("bpm-beat", a);
            for (var t = 0; c > t; t++) u[t] = THREE.ImageUtils.loadTexture("res/img/light-leak/" + t + ".jpg"), u[t].minFilter = u[t].magFilter = THREE.LinearFilter;
            d = new THREE.MeshBasicMaterial({
                map: u[0],
                transparent: !0,
                blending: THREE.AdditiveBlending,
                opacity: .2,
                fog: !1,
                depthTest: !1
            });
            var m = new THREE.PlaneGeometry(800, 800, 1, 1);
            s = new THREE.Mesh(m, d), l.add(s), s.scale.x = s.scale.y = 8, s.position.z = -1e3
        }

        function n() {
            l.visible = v.on
        }

        function t() {
            Math.random() < .7 || (s.rotation.z = Math.random() * Math.PI * 2, d.map = u[ATUtil.randomInt(0, c - 1)])
        }

        function o() {
            l.rotation.z += .005, v.freakOut ? (m = !m, d.opacity = m ? 0 : 1) : d.opacity = v.opacity
        }

        function i() {
            t()
        }

        function a() {}

        function r(e) {
            switch (e.id) {
                case 43:
                    v.freakOut = 1 == e.val
            }
        }
        var l, s, d, u = [],
            c = 1,
            m = !0,
            v = {
                on: !0,
                freakOut: !1,
                opacity: .2
            };
        return {
            init: e,
            getVizParams: function() {
                return v
            },
            onToggleViz: n
        }
    }(),
    Ripples = function() {
        function e() {
            var e = ControlsHandler.getVizFolder().addFolder("Ripples");
            e.add(l, "on").listen().onChange(n), e.add(l, "lineCount", 0, 100).listen().onChange(t), e.add(l, "dotSize", 0, 10.5).listen().onChange(t), e.add(l, "lineSize", 0, 1).listen().onChange(t), e.add(l, "blur", .01, .5).listen().onChange(t), e.add(l, "noiseSpeed", 0, 50).listen().onChange(t), e.add(l, "noiseSize", 0, 10).listen().onChange(t), e.add(l, "lineSpeed", 0, 5).listen().onChange(t), e.add(l, "depth", 0, 300).listen().onChange(t), e.add(l, "opacity", 0, 1).listen().onChange(t), l.on && e.open(), events.on("update", o), events.on("beat", i), events.on("bpm-beat", a), r = new THREE.Object3D, VizHandler.getVizHolder().add(r);
            var s = new THREE.ShaderMaterial({
                    uniforms: THREE.RipplesShader.uniforms,
                    vertexShader: THREE.RipplesShader.vertexShader,
                    fragmentShader: THREE.RipplesShader.fragmentShader,
                    depthTest: !1,
                    blending: THREE.AdditiveBlending,
                    transparent: !0
                }),
                d = new THREE.PlaneGeometry(700, 700, 100, 100),
                u = new THREE.Mesh(d, s);
            r.add(u), u.z = 0, u.scale.x = u.scale.y = 4, t(), n()
        }

        function n() {
            r.visible = l.on
        }

        function t() {
            THREE.RipplesShader.uniforms.lineCount.value = l.lineCount, THREE.RipplesShader.uniforms.blur.value = l.blur, THREE.RipplesShader.uniforms.noiseSize.value = l.noiseSize, THREE.RipplesShader.uniforms.opacity.value = l.opacity
        }

        function o() {
            r.rotation.z += .002;
            var e = .1;
            ControlsHandler.getControlParams().autoMode && (0 === l.vizMode ? (l.lineSize = simplexNoise.noise(VizHandler.getNoiseTime() * e, 0) / 2 + .5, l.dotSize = 0) : 1 === l.vizMode ? (l.dotSize = simplexNoise.noise(VizHandler.getNoiseTime() * e, 0) / 2 + .5 + .5, l.lineSize = 0) : (l.lineSize = simplexNoise.noise(VizHandler.getNoiseTime() * e, 0) / 2 + .5, l.dotSize = 1 - l.lineSize), l.depth = ATUtil.lerp(simplexNoise.noise(VizHandler.getNoiseTime() * e, 10) / 2 + .5, 0, 200), l.blur = ATUtil.lerp(simplexNoise.noise(VizHandler.getNoiseTime() * e, 20) / 2 + .5, 0, .5), l.noiseSpeed = ATUtil.lerp(simplexNoise.noise(VizHandler.getNoiseTime() * e, 30) / 2 + .5, 0, 10), l.noiseSize = ATUtil.lerp(simplexNoise.noise(VizHandler.getNoiseTime() * e, 40) / 2 + .5, 0, 7), l.lineSpeed = ATUtil.lerp(simplexNoise.noise(VizHandler.getNoiseTime() * e, 50) / 2 + .5, 0, 1), l.opacity = ATUtil.lerp(simplexNoise.noise(VizHandler.getNoiseTime() * e, 60) / 2 + .5, .3, 1)), THREE.RipplesShader.uniforms.noiseTime.value += l.noiseSpeed / 1e3, THREE.RipplesShader.uniforms.lineTime.value += l.lineSpeed / 1e3, THREE.RipplesShader.uniforms.dotSize.value = l.dotSize * AudioHandler.getVolume(), THREE.RipplesShader.uniforms.lineSize.value = l.lineSize * AudioHandler.getVolume(), THREE.RipplesShader.uniforms.depth.value = l.depth * AudioHandler.getSmoothedVolume() * 2
        }

        function i() {
            THREE.RipplesShader.uniforms.noiseTime.value = 10 * Math.random(), ControlsHandler.getControlParams().autoMode && Math.random() < .5 && (l.lineCount = ATUtil.randomInt(10, 80), l.vizMode = ATUtil.randomInt(0, 1), t())
        }

        function a() {}
        var r, l = {
            on: !1,
            lineCount: 50,
            dotSize: .3,
            lineSize: .1,
            blur: .1,
            noiseSpeed: 10,
            noiseSize: 4,
            lineSpeed: 1,
            depth: 80,
            vizMode: 0,
            opacity: .7
        };
        return {
            init: e,
            update: o,
            onBeat: i,
            onBPMBeat: a,
            getVizParams: function() {
                return l
            },
            onToggleViz: n
        }
    }(),
    StarBars = function() {
        function e() {
            events.on("midi-control", r);
            var e = ControlsHandler.getVizFolder().addFolder("Bars");
            e.add(c, "on").onChange(n), e.add(c, "size", 0, 5).name("Size").onChange(t), e.add(c, "speed", -10, 10).name("Speed"), e.add(c, "opacity", 0, 1).name("Opacity"), e.add(c, "audioSpeed").name("Audio Speed"), c.on && e.open(), u = new THREE.Object3D, VizHandler.getVizTumbler().add(u), l = new THREE.Geometry, s = new THREE.MeshBasicMaterial({
                color: 16777215,
                blending: THREE.AdditiveBlending,
                depthTest: !1,
                transparent: !0,
                opacity: .8,
                sizeAttenuation: !0,
                side: THREE.DoubleSide
            });
            var d = 1e3,
                f = new THREE.PlaneGeometry(4, 100, 1, 1);
            for (v = [], i = 0; i < m; i++) {
                var g = new THREE.Mesh(f, s);
                g.scale.set(ATUtil.randomRange(.2, 2), ATUtil.randomRange(.2, 2), 1), g.initPos = Math.random(), u.add(g), g.rotation.x = Math.PI / 2, g.position.set(ATUtil.randomRange(-d, d), ATUtil.randomRange(-d, d), 0), v.push(g), g.scaleOffset = Math.random()
            }
            events.on("update", o), events.on("beat", a), t(), n()
        }

        function n() {
            u.visible = c.on
        }

        function t() {
            for (i = 0; i < m; i++) {
                var e = v[i];
                e.scale.set(ATUtil.randomRange(.2, 2 * c.size), ATUtil.randomRange(.2, 2 * c.size), 1)
            }
        }

        function o() {
            f += c.audioSpeed ? c.speed / 200 * (AudioHandler.getVolume() + .2) : c.speed / 600, d = (simplexNoise.noise(f, 0) + 1) / 2, s.color.setHSL(d, .8, .5), s.opacity = c.opacity;
            for (var e = 0; m > e; e++) {
                var n = v[e],
                    t = (n.initPos + f) % 1 * 2e3 - 1e3;
                n.position.z = t
            }
        }

        function a() {
            Math.random() < .5 || (u.rotation.z += Math.random() * Math.PI * 2)
        }

        function r(e) {
            switch (e.id) {
                case 52:
                    c.on = 1 == e.val, n()
            }
        }
        var l, s, d, u, c = {
                on: !0,
                size: 1,
                speed: 2,
                opacity: .5,
                colorRange: .5,
                audioSpeed: !1
            },
            m = 200,
            v = [],
            f = 0;
        return {
            init: e,
            getVizParams: function() {
                return c
            },
            onToggleViz: n
        }
    }(),
    Stars = function() {
        function e() {
            var e = ControlsHandler.getVizFolder().addFolder("Stars");
            e.add(d, "on").onChange(n), e.add(d, "size", 0, 10).name("Size"), e.add(d, "speed", 0, 10).name("Speed"), e.add(d, "opacity", 0, 1).name("Opacity").listen(), d.on && e.open(), s = new THREE.Object3D, VizHandler.getVizTumbler().add(s), a = new THREE.Geometry;
            var l = THREE.ImageUtils.loadTexture("res/img/particle.png");
            r = new THREE.PointCloudMaterial({
                size: 100,
                map: l,
                blending: THREE.AdditiveBlending,
                depthTest: !1,
                transparent: !0,
                opacity: 1
            }), r.particleHue = Math.random(), r.color = new THREE.Color(16777215), r.color.setHSL(r.particleHue, 1, 1);
            var m = 1e3;
            for (i = 0; i < u; i++) {
                var v = new THREE.Vector3(ATUtil.randomRange(-m, m), ATUtil.randomRange(-m, m), ATUtil.randomRange(-m, m));
                a.vertices.push(v);
                var f = {
                    initPos: Math.random()
                };
                c.push(f)
            }
            particles = new THREE.PointCloud(a, r), particles.position.z = -500, particles.sortParticles = !1, s.add(particles), events.on("update", t), events.on("beat", o), n()
        }

        function n() {
            s.visible = d.on
        }

        function t() {
            l = (simplexNoise.noise(VizHandler.getNoiseTime() / 5, 0, 0) + 1) / 2, r.color.setHSL(l, .8, .8), r.opacity = d.opacity, r.size = 10 * d.size;
            for (var e = 0; u > e; e++) {
                var n = c[e],
                    t = (n.initPos + VizHandler.getNoiseTime() * d.speed / 10) % 1 * 3e3 - 1e3;
                a.vertices[e].z = t
            }
            a.verticesNeedUpdate = !0
        }

        function o() {}
        var a, r, l, s, d = {
                on: !0,
                size: 1.5,
                speed: 1,
                opacity: .5
            },
            u = 600,
            c = [];
        return {
            init: e,
            update: t
        }
    }();
THREE.EclipseShader = {
    uniforms: {
        radius: {
            type: "f",
            value: .25
        },
        brightness: {
            type: "f",
            value: .02
        },
        opacity: {
            type: "f",
            value: 1
        },
        time: {
            type: "f",
            value: 0
        },
        levelsTexture: {
            type: "t",
            value: 2
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["const float DOT_COUNT = 16.0;", "uniform float radius;", "uniform float brightness;", "uniform float time;", "uniform float opacity;", "uniform sampler2D levelsTexture;", "varying vec2 vUv;", "vec3 hsv2rgb(vec3 c){", "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);", "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);", "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);", "}", "void main() {", "vec2 p= vUv - 0.5;", "vec3 c=vec3(0,0,0.1);", "for(float i=0.;i < DOT_COUNT; i++){", "float vol = texture2D(levelsTexture, vec2(i/DOT_COUNT, 0.0)).r;", "float b = vol * brightness;", "float x = radius*cos(2.*3.14*float(i)/DOT_COUNT);", "float y = radius*sin(2.*3.14*float(i)/DOT_COUNT);", "vec2 o = vec2(x,y);", "vec3 dotCol = hsv2rgb(vec3((i + time*10.)/DOT_COUNT,1.,1.0));", "c += b/(length(p-o))*dotCol;", "}", "float dist = distance(p , vec2(0));", "c = mix(vec3(0), c, smoothstep(radius + 0.01, radius + 0.015 , dist));", "gl_FragColor = vec4(c,opacity);", "}"].join("\n")
}, THREE.ImageRippleShader = {
    uniforms: {
        texture: {
            type: "t",
            value: null
        },
        audioDepth: {
            type: "f",
            value: 400
        },
        levels: {
            type: "fv1",
            value: []
        },
        numStrips: {
            type: "f",
            value: 60
        },
        opacity: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["uniform sampler2D texture;", "uniform float audioDepth;", "uniform float numStrips;", "uniform float levels[ 100 ];", "uniform float opacity;", "varying vec2 vUv;", "void main() {", "vUv = uv;", "float x = uv.x;", "if (x < 0.5){", "x = 1.0 - 2.0 * x;", "}else{", "x = (x - 0.5) * 2.0 ;", "}", "int index = int(floor( x * numStrips)) - 1;", "float levelVal = levels[ index ];", "float value = levelVal * audioDepth ;", "vec3 newPosition = position + normal * value;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D texture;", "varying vec2 vUv;", "uniform float bulge;", "uniform float opacity;", "void main() {", "vec4 col = texture2D(texture, vUv);", "col.a = opacity;", "gl_FragColor = col;", "}"].join("\n")
}, THREE.RipplesShader = {
    uniforms: {
        noiseTime: {
            type: "f",
            value: 1
        },
        noiseSize: {
            type: "f",
            value: 2
        },
        lineTime: {
            type: "f",
            value: 1
        },
        lineCount: {
            type: "f",
            value: 40
        },
        dotSize: {
            type: "f",
            value: .3
        },
        lineSize: {
            type: "f",
            value: .1
        },
        blur: {
            type: "f",
            value: .05
        },
        depth: {
            type: "f",
            value: 300
        },
        opacity: {
            type: "f",
            value: 1
        }
    },
    vertexShader: ["varying vec2 vUv;", "varying float vNoiseDisp;", "uniform float noiseTime;", "uniform float noiseSize;", "uniform float depth;", "vec3 mod289(vec3 x) {", "return x - floor(x * (1.0 / 289.0)) * 289.0;", "}", "vec2 mod289(vec2 x) {", "return x - floor(x * (1.0 / 289.0)) * 289.0;", "}", "vec3 permute(vec3 x) {", "return mod289(((x*34.0)+1.0)*x);", "}", "float snoise(vec2 v) {", "const vec4 C = vec4(0.211324865405187,", "				  0.366025403784439,", "				 -0.577350269189626,", "				  0.024390243902439);", "vec2 i  = floor(v + dot(v, C.yy) );", "vec2 x0 = v -   i + dot(i, C.xx);", "vec2 i1;", "i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);", "vec4 x12 = x0.xyxy + C.xxzz;", "x12.xy -= i1;", "i = mod289(i); // Avoid truncation effects in permutation", "vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))", "	+ i.x + vec3(0.0, i1.x, 1.0 ));", "vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);", "m = m*m ;", "m = m*m ;", "vec3 x = 2.0 * fract(p * C.www) - 1.0;", "vec3 h = abs(x) - 0.5;", "vec3 ox = floor(x + 0.5);", "vec3 a0 = x - ox;", "m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );", "vec3 g;", "g.x  = a0.x  * x0.x  + h.x  * x0.y;", "g.yz = a0.yz * x12.xz + h.yz * x12.yw;", "return 130.0 * dot(m, g);", "}", "void main() {", "vUv = uv;", "vNoiseDisp = snoise(vUv*noiseSize + noiseTime) ;", "vec3 newPosition = position + normal * vNoiseDisp *depth;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );", "}"].join("\n"),
    fragmentShader: ["const vec3 black = vec3(0.0, 0.0, 0.0);", "uniform float lineTime;", "uniform float noiseTime;", "uniform float lineCount;", "uniform float dotSize;", "uniform float lineSize;", "uniform float blur;", "uniform float opacity;", "varying vec2 vUv;", "varying float vNoiseDisp;", "vec3 hsv2rgb(vec3 c){", "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);", "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);", "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);", "}", "void main() {", "vec3 c = hsv2rgb(vec3(vUv.x + noiseTime, 0.8, 0.7));", "vec2 p = vUv;", "p.y += lineTime;", "vec2 nearest = 2.0*fract(lineCount * p) - 1.0;", "float dist = length(nearest);", "vec3 dotcol = mix(c, black, smoothstep(dotSize, dotSize + dotSize*blur, dist));", "float x = fract(p.y * lineCount) - .5 + lineSize/2.;", "float f = smoothstep(-lineSize*blur,0.0, x) - smoothstep(lineSize, lineSize + lineSize*blur, x);", "vec3 linecol = mix(black, c, f);", "vec3 fragcol = mix(linecol + dotcol, black, -vNoiseDisp );", "gl_FragColor = vec4(fragcol, opacity);", "}"].join("\n")
};