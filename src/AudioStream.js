import {Clip, getContext} from 'phonograph';
import AudioBand from './AudioBand';

const AudioContext = window.AudioContext || window.webkitAudioContext;

export default class AudioStream {
    constructor(src) {
        this.ctx = getContext();
        /*

        this.audio = new Audio();
        this.audio.autoplay = false;
        this.audio.src = src;
        this.element = this.ctx.createMediaElementSource(this.audio);
        */
        this.clip = new Clip({url: src});
        this.clip.buffer().then(() => {
            this.ready = true;
        });
        this.clip.on('play', () => {
            this.playing = true;
        })
        this.clip.on('pause', () => {
            this.playing = false;
        })
        this.clip.on('ended', () => {
            this.playing = false;
        })

        this.freqBinCount = 1024 * 2;
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fft = this.freqBinCount * 2;
        this.buffer = new Uint8Array(this.analyser.frequencyBinCount);

        this.clip.connect(this.analyser);
        this.clip.connect(this.ctx.destination);

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
        this.clip.play();
    }

    pause() {
        this.clip.pause();
    }

    toggle() {
        this.playing ? this.pause() : this.play();
    }

    isPlaying() {
        return this.playing;
    }

    makeBand(name, options) {
        this.bands[name] = new AudioBand(this.ctx, this.clip, options);
    }

    update(band) {
        if (band) {
            this.bands[band].process();
        } else {
            Object.values(this.bands).forEach((band) => band.process());
        }
    }
}
