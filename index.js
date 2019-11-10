const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

const SETTINGS = {
	width: 256,
	height: 128,
	step: 8,
	strokeStyle: '#eb26ed',
	fillStyle: '#101010',
	lineWidth: 2
};

const AUDIO = {
	audio: null, 
	audioContext: null, 
	source: null, 
	analyser: null, 
	dataArray: null, 
	bufferLength: null
};

const canvas = document.querySelector('canvas');
const canvasCtx = canvas.getContext('2d');
canvasCtx.strokeStyle = SETTINGS.strokeStyle;
canvasCtx.lineWidth = SETTINGS.lineWidth;

canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
canvasCtx.fillStyle = SETTINGS.fillStyle;
canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
canvasCtx.beginPath();
canvasCtx.moveTo(0, canvas.height / 2);
canvasCtx.lineTo(canvas.width, canvas.height / 2);
canvasCtx.stroke();

let frame = 0;

const getPoints = (() => {
	
	AUDIO.analyser.getByteTimeDomainData(AUDIO.dataArray);


	const sliceWidth = SETTINGS.width * 1.2 / AUDIO.bufferLength;
	let x = 0;
	let arr = [];

	for(let i = 0; i < AUDIO.bufferLength; i++) {

		let v = AUDIO.dataArray[i] / 128.0;
		let y = v * SETTINGS.height/2;

		if(i % 64 == 0) {
			//console.log((bufferLength / 2) / i);
			arr.push({
				"x" : x,
				"y" : y * 2 - 56
			});
		};

		x += sliceWidth;
	};
	 
	return arr;
});

const draw = (() => {

	if(frame % SETTINGS.step == 0) {
		newarr = getPoints();
	};
	
	if(frame == 0) {
		arr = getPoints();
	};
	
	canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
	canvasCtx.fillStyle = SETTINGS.fillStyle;
	canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

	canvasCtx.beginPath();

	canvasCtx.moveTo(0, canvas.height / 2);


	for (i = 1; i < arr.length - 2; i++) {
		if(newarr.length > 0) {
			if(arr[i].y > newarr[i].y) {
				const diff1 = (arr[i].y - newarr[i].y) / SETTINGS.step;
				arr[i].y -= diff1;
			};
			if(arr[i].y < newarr[i].y) {
				const diff2 = (newarr[i].y - arr[i].y) / SETTINGS.step;
				arr[i].y += diff2;
			};
			if(arr[i + 1].y > newarr[i + 1].y) {
				const diff3 = (arr[i + 1].y - newarr[i + 1].y) / SETTINGS.step;
				arr[i + 1].y -= diff3;
			};
			if(arr[i + 1].y < newarr[i + 1].y) {
				const diff4 = (newarr[i + 1].y - arr[i + 1].y) / SETTINGS.step;
				arr[i + 1].y += diff4;
			};
		};

		const xc = (arr[i].x + arr[i + 1].x) / 2;
		const yc = (arr[i].y + arr[i + 1].y) / 2;
		canvasCtx.quadraticCurveTo(arr[i].x, arr[i].y, xc, yc);

	};

	canvasCtx.quadraticCurveTo(arr[i].x, arr[i].y, canvas.width,canvas.height / 2);
	canvasCtx.stroke();

	frame++;
	requestAnimationFrame(draw);
});

const play = (() => {
	
	AUDIO.audio.play();
	
	btn.innerHTML = 'STOP';
	
	btn.removeEventListener("click", play);
	btn.addEventListener("click", stop);
});

const stop = (() => {
	
	AUDIO.audio.pause();
	
	btn.innerHTML = 'PLAY';
	
	btn.removeEventListener("click", stop);
	btn.addEventListener("click", play);
});

const init = (() => {

	AUDIO.audio = document.querySelector('audio');
	AUDIO.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	AUDIO.source = AUDIO.audioContext.createMediaElementSource(AUDIO.audio);
	AUDIO.analyser = AUDIO.audioContext.createAnalyser();

	AUDIO.source.connect(AUDIO.analyser);
	AUDIO.analyser.connect(AUDIO.audioContext.destination);

	AUDIO.analyser.fftSize = 2048;
	AUDIO.bufferLength = AUDIO.analyser.frequencyBinCount;
	AUDIO.dataArray = new Uint8Array(AUDIO.bufferLength);
	AUDIO.analyser.getByteTimeDomainData(AUDIO.dataArray);

	play();
	draw();
	
	btn.removeEventListener("click", init);
});

const btn = document.querySelector('button');
btn.addEventListener("click", init);