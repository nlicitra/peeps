import Matter from 'matter-js';
import PeepPNG from '../assets/peep.png';
console.log(PeepPNG);

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Events = Matter.Events,
    Bodies = Matter.Bodies;

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#707377',
    },
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

var collider = Bodies.rectangle(400, 700, 1800, 50, {
    isSensor: true,
    isStatic: true,
    render: {
        visible: false,
    },
});

World.add(world, [collider]);

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false,
            },
        },
    });

World.add(world, mouseConstraint);

Events.on(engine, 'afterUpdate', function() {
    if (mouseConstraint.mouse.button === 0) {
        const {x, y} = mouseConstraint.mouse.position;
        const peep = Bodies.circle(x, y, 25, {
            render: {
                sprite: {
                    texture: './peep.40345789.png',
                },
            },
        });
        World.add(engine.world, peep);
    }
});

Events.on(engine, 'collisionStart', function(event) {
    const {pairs} = event;
    pairs.forEach((pair) => {
        if (pair.bodyA === collider) {
            World.remove(engine.world, pair.bodyB);
        } else if (pair.bodyB === collider) {
            World.remove(engine.world, pair.bodyA);
        }
    });
});

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: {x: 0, y: 0},
    max: {x: 800, y: 600},
});
