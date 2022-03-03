//// Deconstruct Matter elements from the library.
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// Number of cells in the grid
const cells = 10;

// Define width and height of our world
const width = 600;
const height = 600;

// Get the length of each cell
const unitLength = width / cells;

// Initialize main elements.
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true,
        width,
        height
    }
});


Render.run(render);
Runner.run(Runner.create(), engine);

// Outer walls
const outerWalls = [
    // Top wall
    Bodies.rectangle(width/2, 0, width, 2, { isStatic: true }),
    // Bottom wall
    Bodies.rectangle(width/2, height, width, 2, { isStatic: true }),
    // Left wall
    Bodies.rectangle(0, height/2, 2, height, { isStatic: true }),
    // Right wall
    Bodies.rectangle(width, height/2, 2, height, { isStatic: true })
];


// Add walls
World.add(world, outerWalls);


// Maze generation

//// Randomize the neighbor arrays
const shuffle = arr => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;
    // Swap elements
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

// Maze generation (3x3 grid full of false values)
const grid = Array(cells)
    .fill(null)
    .map(() => Array(cells).fill(false));

// Create vertical 'walls' inside the maze by tracking them via a 3x2 array
const verticals = Array(cells)
    .fill(null)
    .map(() => Array(cells-1).fill(false));

// Create horizontal 'walls' inside the maze by tracking them via a 2x3 array
const horizontals = Array(cells-1)
    .fill(null)
    .map(() => Array(cells).fill(false));


//// Pick a random cells to start building the maze walls
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);


const stepThroughCell = (row, column) => {
    // if I have already visited the cell at (row, column),
    // I.e. if it stores a true value, then abort.
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as being visited
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    // top neighbor
    [row - 1, column, 'up'],
    // right neighbor
    [row, column + 1, 'right'],
    // bottom neighbor 
    [row + 1, column, 'down'],
    // left neighbor
    [row, column - 1, 'left']
  ]);
  // For each neighbor....
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if the neighbor is out of bounds, if so, continue to next neighbor.
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue;
    }

    // If we have already visited that neighbor (I.e., if it stores a true value),
    // continue to next neighbor.
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // Remove a wall from either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    // 'Visit' that next neighbor
    stepThroughCell(nextRow, nextColumn);
  }
};


stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      5,
      {
        label: 'wall',
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      5,
      unitLength,
      {
        label: 'wall',
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

// Goal of the maze
const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * 0.7,
    unitLength * 0.7,
    {isStatic: true,
     label: 'goal'}
);
World.add(world, goal);

// Win condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        // We can't know if the ball collided with the goal or viceversa,
        // so we have to check like this
        if (labels.includes(collision.bodyA.label) && 
            labels.includes(collision.bodyB.label)) {
                // As a win animation, make the player fall and
                // destroy the walls.
                world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
                })
            }
    });
});


// Ball (player's avatar)
const ball = Bodies.circle(
    unitLength / 2,
    unitLength / 2,
    unitLength / 4,
    {label: 'ball'}
);
World.add(world, ball);

// Make the ball move according to key presses.
document.addEventListener('keydown', event => {
    // Get the ball's velocity.
    const { x, y } = ball.velocity;

    if (event.key === 'w') {
        // W - Up.
        Body.setVelocity(ball, {x, y: y - 5});
    }
    if (event.key === 'd') {
        // D - Right.
        Body.setVelocity(ball, {x: x + 5, y});
    }
    if (event.key === 's') {
        // S - Down.
        Body.setVelocity(ball, {x, y: y + 5});
    }
    if (event.key === 'a') {
        // A - Left.
        Body.setVelocity(ball, {x: x - 5, y});
    }
});
