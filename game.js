// attach & define event listeners

document.addEventListener('keydown', keydown);

// init objects
var snake = new Snake();
var cube = new PosView3D({x: 90, y: 90}, 20, 1, 200);

// event loop

function event_loop() {

    // keep animation going
    window.requestAnimationFrame(event_loop);

    endDate = Date.now();
    elapsed = endDate - startDate;

    cube.update();

    // limit movement to fps
    if (elapsed > (1000/fps)) {
        //update objects
        snake.update();
        // step forward auto dim
        if (auto_dim_ind < grid_len-1) auto_dim_ind++; // TODO when change direction in auto dim?
        startDate = Date.now();
        // debug
        // console.log(snake.history)
    }
    cube.rotateY(0.005);
    // draw functions
    render_all();
    
}

function render_all() {
    // refresh
    canvas_clear();
    snake.render();
    cube.render();
}

// define event listener actions
function keydown(e) {

    // movement
    if      (e.code == "ArrowUp")       snake_dir_update(0, -1);
    else if (e.code == "ArrowDown")     snake_dir_update(0, 1);
    else if (e.code == "ArrowLeft")     snake_dir_update(-1, 0);
    else if (e.code == "ArrowRight")    snake_dir_update(1, 0);

}

// start event loop
event_loop();