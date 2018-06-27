import {FREQ_BIN_COUNT} from './constants';

const FRAME_WINDOW_SIZE = 100;
const SLEEP_AMOUNT = 50;

export default class AudioBand {
    constructor(ctx, element, {lowPass, highPass, callback, threshold}) {
        this.ctx = ctx;

        this.element = element;

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fft = FREQ_BIN_COUNT * 2;
        this.buffer = new Uint8Array(this.analyser.frequencyBinCount);

        const filters = [];
        if (lowPass) {
            this.lowPassFilter = this.ctx.createBiquadFilter();
            this.lowPassFilter.type = 'lowpass';
            this.lowPassFilter.frequency.value = lowPass;
            filters.push(this.lowPassFilter);
        }
        if (highPass) {
            this.highPassFilter = this.ctx.createBiquadFilter();
            this.highPassFilter.type = 'highpass';
            this.highPassFilter.frequency.value = highPass;
            filters.push(this.highPassFilter);
        }
        const filteredElement = filters.reduce((chain, filter) => {
            chain.connect(filter);
            return filter;
        }, this.element);

        filteredElement.connect(this.analyser);
        this.callback = callback || function() {};
        this.frames = new Array(FRAME_WINDOW_SIZE).fill(0);
        this.average = 0;
        this.sleepCounter = 0;
        this.sleeping = false;

        this.threshold = threshold;
    }

    trigger() {
        if (this.sleeping) {
            this.sleepCounter--;
            if (this.sleepCounter <= 0) {
                this.sleeping = false;
            }
        }
        if (this.sleepCounter <= 0) {
            this.callback();
            this.sleeping = true;
            this.sleepCounter = SLEEP_AMOUNT;
        }
    }

    process() {
        this.analyser.getByteFrequencyData(this.buffer);
        const frame = Math.max(...this.buffer);
        if (this.threshold) {
            if (frame >= this.threshold) {
                this.trigger();
            } else {
                this.sleeping = false;
                this.sleepCounter = 0;
            }
        } else {
            if (this.average < frame) {
                this.trigger();
            } else {
                this.sleeping = false;
                this.sleepCounter = 0;
            }
            this.frames.shift();
            this.frames.push(frame);
            this.average =
                this.frames.reduce((total, frame) => total + frame, 0) /
                this.frames.length;
        }
    }
}
