import AudioBand from './AudioBand';

const AudioContext = window.AudioContext || window.webkitAudioContext;

export default class AudioStream {
    constructor(src) {
        this.ctx = new AudioContext();

        this.audio = new Audio();
        this.audio.autoplay = false;
        this.audio.src = src;
        this.element = this.ctx.createMediaElementSource(this.audio);

        this.freqBinCount = 1024 * 2;
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fft = this.freqBinCount * 2;
        this.buffer = new Uint8Array(this.analyser.frequencyBinCount);

        this.element.connect(this.analyser);
        this.element.connect(this.ctx.destination);

        this.bands = {};

        window.setInterval(() => {
            this.update();
        }, 10);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 32) {
                this.toggle();
            }
        });
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    toggle() {
        this.audio.paused ? this.play() : this.pause();
    }

    isPlaying() {
        return !this.audio.paused;
    }

    makeBand(name, options) {
        this.bands[name] = new AudioBand(this.ctx, this.element, options);
    }

    update(band) {
        if (band) {
            this.bands[band].process();
        } else {
            Object.values(this.bands).forEach((band) => band.process());
        }
    }
}
