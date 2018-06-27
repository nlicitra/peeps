import AudioStream from './AudioStream';
import Renderer from './Renderer';
import PeepsMP3 from '../assets/peeps.mp3';
import PeepPNG from '../assets/peep.png';
import BurgerPNG from '../assets/burgerman.png';

const renderer = new Renderer();

const stream = new AudioStream(PeepsMP3);

setTimeout(() => {
    const logos = document.querySelector('.logos-container');
    logos.addEventListener('click', () => {
        stream.toggle();
    });
}, 0);

stream.makeBand('low', {
    highPass: 200,
    lowPass: 150,
    callback: () => {
        renderer.burst(BurgerPNG);
        renderer.burst(BurgerPNG);
        renderer.burst(BurgerPNG);
        renderer.burst(BurgerPNG);
    },
});
stream.makeBand('mid', {
    highPass: 1000,
    lowPass: 2000,
    threshold: 200,
    callback: () => {
        renderer.burst(PeepPNG);
        renderer.burst(PeepPNG);
        renderer.burst(PeepPNG);
        renderer.burst(PeepPNG);
    },
});
stream.makeBand('high', {
    highPass: 5000,
    threshold: 200,
    callback: () => {},
});
