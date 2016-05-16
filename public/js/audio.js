// var audio_reader;

// $('#dropzone').filedrop({
//     drop: function() {
//        	var file = event.dataTransfer.files[0];
//         var reader = new FileReader();
//         reader.onload = function(fileEvent) {    
//             var data = fileEvent.target.result;
//         };
//         reader.readAsArrayBuffer(file);
//     },
//     maxfilesize: 20,
//     beforeSend: function(file, i, done) {
//         debugger;
//         var audio_data = event.target.result;
//         audio_reader = new AudioReader();
//         audio_reader.init();
//         audio_reader.decode(audio_data);
//         return false;
//     }        
// })

var AudioReader = function () {
	var 
		self = this,
		waveData = [],
		levelsData = [],
		level = [],
		bmpTime = 0,
		ratedBPMTime = 550,
		levelHistory = [],
		bmpStart,
		audio_url,

		BEAT_HOLD_TIME = 40,
		BEAT_DECAY_RATE = 0.98,
		BEAT_MIN = 0.15,

    	count = 0,
    	msecsFirst = 0,
    	msecsPrevious = 0,
    	msecsAvg = 633, //time between beats (msec)	

		timer,
    	gotBeat = false,
    	beatCutOff = 0,
    	beatTime = 0,


	    freqByteData, //bars - bar data is from 0 - 256 in 512 bins. no sound is 0;
	    timeByteData, //waveform - waveform data is from 0-256 for 512 bins. no sound is 128.
	    levelsCount = 16, //should be factor of 512
	    binCount, //512
	    levelBins,
	    isPlayingAudio = false,
	    isBit = false,
	    source,
	    buffer,
	    audioBuffer,
	    dropArea,
	    audioContext,
	    analyser;

   	function init() {
		// здесь создаем аналайзер и прочитай объекты для аналиzа
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.8; //0<->1. 0 is no time smoothing
        analyser.fftSize = 1024;
        analyser.connect(audioContext.destination);
        binCount = analyser.frequencyBinCount; // = 512

        levelBins = Math.floor(binCount / levelsCount); //number of bins in each level

        freqByteData = new Uint8Array(binCount); 
        timeByteData = new Uint8Array(binCount);

        var length = 256;
        for(var i = 0; i < length; i++) {
            levelHistory.push(0);
        }

       	source = audioContext.createBufferSource();
    	source.connect(analyser);			 
   	}

    function loadFile(url) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = function() {
            // decode(request.response);
            audioContext.decodeAudioData(request.response, function(buffer) {
                audioBuffer = buffer;
                play();
            }, function(e) {
                console.log(e);
            });
        };
        request.send();
    }

	function base64ToArrayBuffer(base64) {
	    var binary_string =  window.atob(base64.split(',')[1]);
	    var len = binary_string.length;
	    var bytes = new Uint8Array( len );
	    for (var i = 0; i < len; i++)        {
	        bytes[i] = binary_string.charCodeAt(i);
	    }
	    return bytes.buffer;
	}

   	function decode(audio_data) {
   		var buffer_audio_data = base64ToArrayBuffer(audio_data);
        if(audioContext.decodeAudioData) {
			audioContext.decodeAudioData(buffer_audio_data, function(buffer) {
			    audioBuffer = buffer;
			    play();
			}, function(e) {
                console.log(e);
			});
        } else {
            audioBuffer = audioContext.createBuffer(buffer_audio_data, false);
        	play.bind(this);
        }
   	}

   	function play() {
        source.buffer = audioBuffer;
        source.loop = true;
        source.start(0.0);
        isPlayingAudio = true;
        update();
   	}

    function stop() {
        isPlayingAudio = false;
        if (source) {
            source.stop(0);
            source.disconnect();
        }
    }

    function update() {
    	if (!isPlayingAudio) return ;
        analyser.getByteFrequencyData(freqByteData); //<-- bar chart
        analyser.getByteTimeDomainData(timeByteData); // <-- waveform

        for(var i = 0; i < binCount; i++) {
            waveData[i] = ((timeByteData[i] - 128) /128 );
        }

	    for(var i = 0; i < levelsCount; i++) {
            var sum = 0;
            for(var j = 0; j < levelBins; j++) {
                sum += freqByteData[(i * levelBins) + j];
            }
            levelsData[i] = sum / levelBins/256;
	    }	

        //GET AVG LEVEL
        var sum = 0;
        for(var j = 0; j < levelsCount; j++) {
            sum += levelsData[j];
        }
        
        level = sum / levelsCount;

        levelHistory.push(level);
        levelHistory.shift(1);
        //BEAT DETECTION
        if (level  > beatCutOff && level > BEAT_MIN){
            isBeat = true;
            beatCutOff = level *1.1;
            beatTime = 0;
        }else{
            if (beatTime <= 40){
                beatTime ++;
            }else{
                beatCutOff *= 0.97;
                beatCutOff = Math.max(beatCutOff,BEAT_MIN);
            }
            isBeat = false;
        }
        // console.log(currentData())
	    window.requestAnimationFrame(update);
    }

    function currentData() {
    	return {
    		levelsData : levelsData,
    		levelHistory : levelHistory,
    		isBeat : isBeat,
    		level : level
    	}
    }

    return {
    	init : init, 
    	decode : decode,
    	update : update,
    	data : currentData,
        loadFile : loadFile
    }

}
