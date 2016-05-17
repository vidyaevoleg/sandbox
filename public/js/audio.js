// var audio_reader;

// $('#dropzone').filedrop({
//     drop: function() {
//        	var file = event.dataTransfer.files[0];
//         var reader = new FileReader();
//         reader.onload = function(fileEvent) {
//             var data = fileEvent.target.result;
//             console.log(data)
//         };
//         reader.readAsArrayBuffer(file)
//     },
//     maxfilesize: 20,
//     beforeSend: function(file, i, done) {
//         var audio_data = event.target.result;
//         audio_reader = new AudioReader();
//         audio_reader.init(audio_data);
//         return false
//     }        
// })


// читаем 

function AudioReader () {
	var 
		waveData = [],
		levelsData = [],
		level = [],
		levelHistory = [],

		BEAT_MIN = 0.06,

    	beatCutOff = 0,
    	beatTime = 0,

	    freqByteData,
	    timeByteData,
	    levelsCount = 16, // число баров в гистограмме ()
	    binCount, // делитель 512
	    levelBins,
	    isPlayingAudio = false,
	    isBeat = false,
	    source,
	    buffer,
	    audioBuffer,
	    audioContext,
	    analyser;

   	this.init = function (audio_data) {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
        analyser.connect(audioContext.destination);

        binCount = analyser.frequencyBinCount;
        levelBins = Math.floor(binCount / levelsCount);

        freqByteData = new Uint8Array(binCount); 
        timeByteData = new Uint8Array(binCount);

        var length = 256;
        for(var i = 0; i < length; i++) {
            levelHistory.push(0);
        }

       	source = audioContext.createBufferSource();
    	source.connect(analyser);
    	// decode(audio_data);		 
   	}

    this.loadFile = function (url) {
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

    this.stop = function () {
        isPlayingAudio = false;
        if (source) {
            source.stop(0);
            source.disconnect();
        }
    }

    this.getData = function () {
        return {
            levels : levelsData, // гистограмма
            waveData : waveData, // волна
            isBeat : isBeat, // бит ли сейчас ? 
            volume : level // громкость музычки
        }
    }
    
    this.isPlaying = function () {
        return isPlayingAudio;
    }


    function play() {
        source.buffer = audioBuffer;
        source.loop = true;
        source.start(0.0);
        isPlayingAudio = true;
        update();
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
            audioBuffer = audioContext.createBuffer(buffer_audio_data, false );
            play();
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

        var sum = 0;
        for(var j = 0; j < levelsCount; j++) {
            sum += levelsData[j];
        }
        
        level = sum / levelsCount;
        levelHistory.push(level);
        levelHistory.shift(1);

        // определяем бит
        if (level  > beatCutOff && level > BEAT_MIN) {
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
	    window.requestAnimationFrame(update);
    }


}

