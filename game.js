// attach & define event listeners

document.addEventListener('keydown', keydown);

// init objects
var snake = new Snake();
var cube = new PosView3D({x: 50, y: 50}, 20, 1, 200);
// var cube = new PosView3D({x: 90, y: 90}, 20, 1, 200);

// event loop

function event_loop() {

    // keep animation going
    // window.requestAnimationFrame(event_loop);

    endDate = Date.now();
    elapsed = endDate - startDate;

    cube.update(snake);

    // limit movement to fps
    if (elapsed > (1000/fps)) {
        // step forward auto dim (wrapping around in snake update)
        auto_dim_ind = (auto_dim_ind + 1)%grid_len;
        //update objects
        snake.update();
        startDate = Date.now();
        // debug
        // console.log(snake.history)
    }
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