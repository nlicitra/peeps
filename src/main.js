import AudioStream from './AudioStream';
import Renderer from './Renderer';
import PeepsMP3 from '../assets/peeps.mp3';
import PeepPNG from '../assets/peep.png';
import BurgerPNG from '../assets/burgerman.png';
import {mobileAndTabletCheck} from './utils';

const isMobile = mobileAndTabletCheck();

const renderer = new Renderer();

const initAudio = () => {
    const stream = new AudioStream(PeepsMP3);
    stream.makeBand('low', {
        highPass: 200,
        lowPass: 150,
        callback: () => {
            if (visible) {
                renderer.burst(BurgerPNG);
                renderer.burst(BurgerPNG);
                renderer.burst(BurgerPNG);
                renderer.burst(BurgerPNG);
            }
        },
    });
    stream.makeBand('mid', {
        highPass: 1000,
        lowPass: 2000,
        threshold: 200,
        callback: () => {
            if (visible) {
                renderer.burst(PeepPNG);
                renderer.burst(PeepPNG);
                renderer.burst(PeepPNG);
                renderer.burst(PeepPNG);
            }
        },
    });
    stream.makeBand('high', {
        highPass: 5000,
        threshold: 200,
        callback: () => {},
    });

    return stream;
};

let stream = null;

setTimeout(() => {
    const logos = document.querySelector('.logos-container');
    if (isMobile) {
        logos.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (!stream) {
                stream = initAudio();
            }
            stream.toggle();
        });
    } else {
        stream = initAudio();
        logos.addEventListener('click', (event) => {
            event.preventDefault();
            stream.toggle();
        });
    }
}, 0);

var hidden, visibilityChange;
if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
} else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
} else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
}

let visible = true;
document.addEventListener(
    visibilityChange,
    () => {
        visible = !document[hidden];
    },
    false,
);
