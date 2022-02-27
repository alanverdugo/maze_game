// Deconstruct Matter elements from the library.
const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

// Define width and height of our world
const width = 800;
const height = 600;

// Initialize main elements.
const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Enable draggable Bodies
World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

// Walls
const walls = [
    // Top wall
    Bodies.rectangle(width/2, 0, width, 40, { isStatic: true }),
    // Bottom wall
    Bodies.rectangle(width/2, height, width, 40, { isStatic: true }),
    // Left wall
    Bodies.rectangle(0, height/2, 40, height, { isStatic: true }),
    // Right wall
    Bodies.rectangle(width, height/2, 40, height, { isStatic: true })
];

// Add walls
World.add(world, walls);

// Add random shapes in random positions inside our borders
for (let i = 0; i < 20; i++) {
    if (Math.random() > 0.5) {
        World.add(
            world,
            Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50));
    } else {
        World.add(
            world,
            Bodies.circle(Math.random() * width, Math.random() * height, 35, {
                render: {
                    fillStyle: 'green'
                }
            }));
    }
}
