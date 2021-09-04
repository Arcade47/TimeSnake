var canvas = document.getElementById("GameCanvas");
var ctx = canvas.getContext("2d");

// event listener upon resize
window.addEventListener("resize", resize); // window?

function canvas_clear(color="white") {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();
}

function resize() {
    dim = Math.min(window.innerWidth, window.innerHeight);
    ctx.canvas.width    = dim;
    ctx.canvas.height   = dim;
    // adjust scale
    cs = dim/grid_len;
}

// init size with initial call to resize
resize();

// draw functions (add a scale factor to each one)

function draw_debug_cell(pos=center_pos, color="yellow") {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(cs*pos.d1, cs*pos.d2, cs, cs);
    ctx.closePath();
}