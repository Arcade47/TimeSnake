// user parameters

const grid_len = 100; // 60*60 = 3600 cells (positions on screen)
const fps = 5;

// global utility constants

const center_pos = {d1: grid_len/2, d2: grid_len/2};
const dim_order = ["xy", "xt", "ty"];

// global vars to keep track of changes

var cs = 1; // current scale
var startDate = Date.now();
var auto_dim_ind = 0; // dimension that moves automatically; initially the "time" dimension
var auto_dim_dir = 1; // 1: forward; -1: backwards

// utility functions

function snake_dir_update(d1=0, d2=0) {
    snake.vel.d1 = d1;
    snake.vel.d2 = d2;
    // console.log([snake.pos_3D.x, snake.pos_3D.y, snake.pos_3D.t]); // debug
    snake.history.push({
        x: snake.pos_3D.x,
        y: snake.pos_3D.y,
        t: snake.pos_3D.t
    });
}