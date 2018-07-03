import Matter from 'matter-js';
import PeepPNG from '../assets/peep.png';

const WIDTH = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0,
);
const HEIGHT = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0,
);

export default class Renderer {
    constructor() {
        // To prevent multiple canvas elements on hot reloading
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.remove();
        }

        // create engine
        const engine = Matter.Engine.create();
        const world = engine.world;

        // create renderer
        const render = Matter.Render.create({
            element: document.body,
            engine: engine,
            options: {
                width: WIDTH,
                height: HEIGHT,
                wireframes: false,
                background: '#73FFF1',
            },
        });
        Matter.Render.run(render);

        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, engine);

        const peepCatcher = Matter.Bodies.rectangle(
            WIDTH / 2,
            HEIGHT + 200,
            WIDTH * 10,
            50,
            {
                isSensor: true,
                isStatic: true,
                render: {
                    visible: false,
                },
            },
        );

        Matter.World.add(world, [peepCatcher]);

        // add mouse control
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false,
                },
            },
        });

        Matter.World.add(world, mouseConstraint);

        const max = (data) => {
            return data.reduce((max, d) => (d > max ? d : max), 0);
        };

        const avg = (data) => {
            const values = data.filter((x) => x);
            return values.reduce((total, d) => d + total, 0) / values.length;
        };

        Matter.Events.on(engine, 'collisionStart', function(event) {
            const {pairs} = event;
            pairs.forEach((pair) => {
                if (pair.bodyA === peepCatcher) {
                    Matter.World.remove(engine.world, pair.bodyB);
                } else if (pair.bodyB === peepCatcher) {
                    Matter.World.remove(engine.world, pair.bodyA);
                }
            });
        });

        // keep the mouse in sync with rendering
        render.mouse = mouse;

        // fit the render viewport to the scene
        Matter.Render.lookAt(render, {
            min: {x: 0, y: 0},
            max: {x: WIDTH, y: HEIGHT},
        });

        this.engine = engine;
    }

    createObj(url, x, y, radius) {
        return Matter.Bodies.circle(x, y, radius, {
            render: {
                sprite: {
                    texture: `.${url}`,
                },
            },
        });
    }

    burst(url, isMobile) {
        const radius = isMobile ? 10 : 25;
        const magnitude = isMobile ? 0.01 : 0.1;
        const x = Math.random() * (WIDTH - 100) + 50;
        const y = Math.random() * (HEIGHT - 100) + 50;
        let obj = this.createObj(url, x + radius, y + radius, radius);
        Matter.Body.applyForce(obj, obj.position, {x: magnitude, y: magnitude});
        Matter.World.add(this.engine.world, obj);
        obj = this.createObj(url, x + radius, y - radius, radius);
        Matter.Body.applyForce(obj, obj.position, {
            x: magnitude,
            y: -magnitude,
        });
        Matter.World.add(this.engine.world, obj);
        obj = this.createObj(url, x - radius, y - radius, radius);
        Matter.Body.applyForce(obj, obj.position, {
            x: -magnitude,
            y: -magnitude,
        });
        Matter.World.add(this.engine.world, obj);
        obj = this.createObj(url, x - radius, y + radius, radius);
        Matter.Body.applyForce(obj, obj.position, {
            x: -magnitude,
            y: magnitude,
        });
        Matter.World.add(this.engine.world, obj);
    }

    launchPeeps(color) {
        const x = Math.random() * WIDTH;
        const dir = (x - WIDTH) / (WIDTH * 10);
        const y = HEIGHT + 100;
        const peep = Matter.Bodies.circle(x, y, 25, {
            render: {
                //fillStyle: color,
                sprite: {
                    texture: `.${PeepPNG}`,
                },
            },
        });
        Matter.Body.applyForce(peep, peep.position, {
            x: Math.random() * dir,
            y: -0.1 - Math.random() * 0.2,
        });
        Matter.World.add(this.engine.world, peep);
    }

    bodies() {
        return Matter.Composite.allBodies(this.engine.world);
    }
}
