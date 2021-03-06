import AudioStream from './AudioStream';
import Renderer from './Renderer';
import PeepsMP3 from '../assets/peeps.mp3';
import PeepPNG from '../assets/peep.png';
import BurgerPNG from '../assets/burgerman.png';
import BeachballPNG from '../assets/beachball.png';
import PeepPNGSmall from '../assets/peep-small.png';
import BurgerPNGSmall from '../assets/burgerman-small.png';
import BeachballPNGSmall from '../assets/beachball-small.png';
import {mobileAndTabletCheck} from './utils';

const isMobile = mobileAndTabletCheck();

const Burger = isMobile ? BurgerPNGSmall : BurgerPNG;
const Peep = isMobile ? PeepPNGSmall : PeepPNG;
const Beachball = isMobile ? BeachballPNGSmall : BeachballPNG;

const renderer = new Renderer();

const initAudio = () => {
    const stream = new AudioStream(PeepsMP3);
    stream.makeBand('low', {
        highPass: 150,
        lowPass: 200,
        callback: () => {
            if (visible) {
                if (isMobile) {
                    renderer.spawn(Burger, count);
                } else {
                    renderer.burst(Burger, isMobile);
                    renderer.burst(Burger, isMobile);
                    renderer.burst(Burger, isMobile);
                }
            }
        },
    });
    stream.makeBand('mid', {
        highPass: 1000,
        lowPass: 2000,
        threshold: 200,
        callback: () => {
            if (visible) {
                if (isMobile) {
                    renderer.spawn(Peep, count);
                } else {
                    renderer.burst(Peep, isMobile);
                    renderer.burst(Peep, isMobile);
                    renderer.burst(Peep, isMobile);
                }
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
let count = 8;

setTimeout(() => {
    const canvas = document.querySelector('canvas');
    const instructions = document.querySelector('.instructions');
    document.querySelector('.text').classList.add('fade-in');
    if (isMobile) {
        document.querySelector('.text').innerHTML = 'Touch Me';
        instructions.addEventListener(
            'touchstart',
            (event) => {
                event.preventDefault();
                if (!stream) {
                    stream = initAudio();
                }
                setTimeout(() => {
                    canvas.addEventListener('touchstart', (event) => {
                        [...event.touches].forEach(({clientX, clientY}) => {
                            renderer.spawn(Beachball, 1, clientX, clientY);
                        });
                    });
                    instructions.remove();
                    stream.toggle();
                    setTimeout(() => {
                        count = 15;
                    }, 60000);
                }, 3000);
                instructions.classList += ' fade-out';
            },
            {once: true},
        );
    } else {
        stream = initAudio();
        instructions.addEventListener(
            'click',
            (event) => {
                event.preventDefault();
                setTimeout(() => {
                    canvas.addEventListener('click', (event) => {
                        renderer.spawn(
                            Beachball,
                            1,
                            event.clientX,
                            event.clientY,
                        );
                    });
                    instructions.remove();
                    stream.toggle();
                }, 3000);
                instructions.classList += ' fade-out';
            },
            {once: true},
        );
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
