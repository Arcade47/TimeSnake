// player
class Snake {
    constructor() {
        // make copy of center dim
        this.pos = {
            d1: center_pos.d1,
            d2: center_pos.d2
        };
        this.pos_3D = this.get_3d_pos();
        this.dim = "xy"; // options: xy xt ty
        // this means: x is always d1 (if under control); y is always d2 (if under control)
        this.vel = {
            d1: 0,
            d2: 0
        };
        this.history = [this.get_3d_pos(), this.get_3d_pos()]; // store the turning points
        this.length = 20; // initial length
    }
    get_3d_pos() {
        var pos_3D = {x: 0, y: 0, t: 0};
        let vals = [
            [this.pos.d1,   this.pos.d2,    auto_dim_ind],
            [this.pos.d1,   auto_dim_ind,   this.pos.d2],
            [auto_dim_ind,  this.pos.d2,    this.pos.d1]
        ];
        for (let i = 0; i < dim_order.length; i++) {
            const dim_o = dim_order[i];
            if (this.dim == dim_o) {
                pos_3D.x = vals[i][0];
                pos_3D.y = vals[i][1];
                pos_3D.t = vals[i][2];
            }
        }
        return pos_3D;
    }
    get_unwrapped_p2(p1, p2) {
        // easy test when considering constraints:
        // can only wrap in auto dimension
        // auto dimension always increases

        if (this.dim=="xy" && p2.t < p1.t) return {x: p2.x, y: p2.y, t: p2.t + grid_len};
        if (this.dim=="xt" && p2.y < p1.y) return {x: p2.x, y: p2.y + grid_len, t: p2.t};
        if (this.dim=="ty" && p2.x < p1.x) return {x: p2.x + grid_len, y: p2.y, t: p2.t};
        return p2;
    }
    get_line_len(p1, p2) {

        // ensure it is not wrapped around
        p2 = this.get_unwrapped_p2(p1, p2);

        // possibilites: change in 1 dimension or in 2 dimensions
        // (3 not possible since no diagonal movement)
        // in any case, just count difference in one changing dimension
        // remove one element, else the endpoints are counted double

        // get difference
        // only test each dimension against each other, since difference in 2 dims always equal
        let tests = [
            [p1.x, p2.x],
            [p1.y, p2.y],
            [p1.t, p2.t]
        ];

        for (let i = 0; i < tests.length; i++) {
            let a = tests[i][0];
            let b = tests[i][1];
            // sufficient to break the search after first difference
            // difference is always the same regardless of number of affected dimensions (1 or 2)
            if (a - b != 0) return Math.abs(a - b);
        }
        
        // nothing found
        return 0;
    }
    interpolate(p1, p2, reduce_by) {

        // consider case of wrap around in length computation
        var unwrapped_p2 = this.get_unwrapped_p2(p1, p2);

        // returns a new point pn on line p1 to p2, so that len(pn,p2) == (len(p1,p2) - reduce_by)

        // first find how many and which dimensions are affected
        // TODO maybe: make function more efficient

        // first catch special cases
        if (reduce_by == 0) return p1;
        if (reduce_by == this.get_line_len(p1, unwrapped_p2)) return p2;

        var np = {x: p1.x, y: p1.y, t: p1.t};

        // get difference
        let tests = [
            [p1.x, unwrapped_p2.x],
            [p1.y, unwrapped_p2.y],
            [p1.t, unwrapped_p2.t]
        ];

        for (let i = 0; i < tests.length; i++) {
            let a = tests[i][0];
            let b = tests[i][1];
            if (a - b != 0) {
                if (i == 0 && a - b < 0) np.x += reduce_by;
                if (i == 0 && a - b > 0) np.x -= reduce_by;
                if (i == 1 && a - b < 0) np.y += reduce_by;
                if (i == 1 && a - b > 0) np.y -= reduce_by;
                if (i == 2 && a - b < 0) np.t += reduce_by;
                if (i == 2 && a - b > 0) np.t -= reduce_by;
            }
        }
        // // wrap around again
        // if (np.x < 0)           np.x = grid_len + np.x;
        // if (np.x >= grid_len)   np.x -= grid_len;
        // if (np.y < 0)           np.y = grid_len + np.y;
        // if (np.y >= grid_len)   np.y -= grid_len;
        // if (np.t < 0)           np.t = grid_len + np.t;
        // if (np.t >= grid_len)   np.t -= grid_len;

        return np;

    }
    set_tail() {

        // adjusts the history points
        // go backwards and count the cumulative length
        var cum_len = 0;
        var new_history = [];
        var shortened = false;

        for (let i = this.history.length-1; i > 0; i--) {
            new_history.unshift(this.history[i]);
            let b = this.history[i];
            let a = this.history[i-1];
            cum_len += this.get_line_len(a, b);
            if (cum_len >= this.length) {
                shortened = true;
                let shorten_by = cum_len - this.length;
                var np = this.interpolate(a, b, shorten_by);
                new_history.unshift(np);
                break;
            }
        }
        if (!shortened) new_history.unshift(this.history[0]);

        // set the history to new list
        this.history = new_history;
    }
    update() {
        // apply velocity, only if there is space left
        var test_d1 = this.pos.d1 + this.vel.d1;
        var test_d2 = this.pos.d2 + this.vel.d2;
        if (test_d1 >= 0 && test_d1 < grid_len) this.pos.d1 = test_d1;
        if (test_d2 >= 0 && test_d2 < grid_len) this.pos.d2 = test_d2;

        // set the 3D position depending on current dimension
        this.pos_3D = this.get_3d_pos();

        // set the current head of history to current position
        this.history[this.history.length-1] = this.pos_3D;

        // store the position at wrapping around for easier rendering later
        if (auto_dim_ind == grid_len - 1 || auto_dim_ind == 0) {
            this.history.push(this.pos_3D);
        }

        // clamp the tail according to snake's length
        this.set_tail();

        // add a wrap around for each coordinate (pos & history)
        for (let i = 0; i < this.history.length; i++) {
            let c = this.history[i];
            if (this.dim == "xy" && c.t >= grid_len) this.history[i].t = this.history[i].t%grid_len;
            if (this.dim == "xt" && c.y >= grid_len) this.history[i].y = this.history[i].y%grid_len;
            if (this.dim == "ty" && c.x >= grid_len) this.history[i].x = this.history[i].x%grid_len;
        }
        if (this.pos_3D.x >= grid_len) this.pos_3D.x -= grid_len;

    };
    render() {
        // debug
        draw_debug_cell(this.pos, "black");
    }
}

class PosView3D {
    constructor(translate, dist, size, focal_len) {
        // setup 3D coordinates
        // copied from: https://github.com/pothonprogramming/pothonprogramming.github.io/blob/master/content/cube/cube.html
        this.size = size*0.5;
        this.focal_len = focal_len;
        this.x = 0;
        this.y = 0;
        this.z = dist;
        // store initial points as untransformed version (not rotated etc.)
        this.points_3D_init = [
            [-this.size, -this.size, this.z - this.size],
            [ this.size, -this.size, this.z - this.size],
            [ this.size,  this.size, this.z - this.size],
            [-this.size,  this.size, this.z - this.size],
            [-this.size, -this.size, this.z + this.size],
            [ this.size, -this.size, this.z + this.size],
            [ this.size,  this.size, this.z + this.size],
            [-this.size,  this.size, this.z + this.size]
        ];
        this.points_3D = []; // filled in update function
        this.snake_points_3D = []; // filled in update function
        this.snake_points_2D = []; // filled in update function
        this.faces = [
            [0, 1, 2, 3], 
            [0, 4, 5, 1], 
            [1, 5, 6, 2], 
            [3, 2, 6, 7], 
            [0, 3, 7, 4], 
            [4, 7, 6, 5]
        ];
        this.proj_2D_points =       this.get_projected_2D_cube();
        this.proj_2D_snake_points = this.get_projected_2D_snakepath();
        this.current_rad = 0;
        this.translate = translate;
        // debug
        this.debug_line = [
            {x: 0, y: 0, t: 0},
            {x: grid_len, y: grid_len, t: grid_len},
        ];
    }
    get_projected_2D_cube() {
        var points_2D = [];
        for (let i = 0; i < this.points_3D.length; i++) {
            let v = this.points_3D[i];
            let x = v[0]*(this.focal_len/v[2]);
            let y = v[1]*(this.focal_len/v[2]);

            points_2D.push({cx: x, cy: y});
        }
        return points_2D;
    }
    get_projected_2D_snakepath() {
        var snake_points_2D = [];

        for (let ppi = 0; ppi < this.snake_points_3D.length; ppi++) {
            snake_points_2D.push([]);
            const coords = this.snake_points_3D[ppi];
            for (let i = 0; i < coords.length; i++) {
                let v = coords[i];
                let x = v[0]*(this.focal_len/v[2]);
                let y = v[1]*(this.focal_len/v[2]);

                snake_points_2D[snake_points_2D.length-1].push({cx: x, cy: y});
            }
        }

        return snake_points_2D;
    }
    rotateY(rad) {

        // TODO figure out why this addition necessary (shouldn't work)
        this.current_rad = (this.current_rad + rad)%(2*Math.PI);
        var cos = Math.cos(this.current_rad);
        var sin = Math.sin(this.current_rad);

        // for the cube
        this.points_3D = []; // start as empty, will be filled below
        for (let i = 0; i < this.points_3D_init.length; i++) {
            let v = this.points_3D_init[i];
            let x = (v[2] - this.z)*sin - v[0]*cos;
            let z = (v[2] - this.z)*cos + v[0]*sin;
            this.points_3D.push([x + this.x, v[1], z + this.z]);
        }

        // for the snake
        // no need to start empty, is read out from snake with absolute coords every frame
        for (let i = 0; i < this.snake_points_3D.length; i++) {
            let v = this.snake_points_3D[i];
            let x = (v[2] - this.z)*sin - v[0]*cos;
            let z = (v[2] - this.z)*cos + v[0]*sin;
            this.snake_points_3D[i][0] = x + this.x;
            this.snake_points_3D[i][2] = z + this.z;
        }
    }
    get_converted_snake_coords(path_parts) {
        var cube_coords = [];
        for (let ppi = 0; ppi < path_parts.length; ppi++) {
            cube_coords.push([]);
            const coords = path_parts[ppi];
            console.log(coords)
            for (let i = 0; i < coords.length; i++) {
                // coords format: 0 to grid_len-1
                // needed format: -this.size to this.size
                let x = ((coords[i].x/grid_len)*2*this.size) - this.size;
                let y = ((coords[i].y/grid_len)*2*this.size) - this.size;
                let z = ((coords[i].t/grid_len)*2*this.size) - this.size + this.z;
                cube_coords[cube_coords.length-1].push([x, y, z]);
            }
        }
        console.log(cube_coords)
        return cube_coords;
    }
    update(snake) {
        
        // TODO clamp to relevant points only (maybe in snake class)
        // TODO reduce to current snake size
        // TODO draw 2 lines in case of wrap around
        // first test for wrap around
        var all_visible_snake_path_parts = [[snake.history[0]]];
        for (let i = 1; i < snake.history.length; i++) {
            let a = snake.history[i - 1];
            let b = snake.history[i];
            console.log(a)
            console.log(b)
            all_visible_snake_path_parts[all_visible_snake_path_parts.length-1].push(a);
            var wrap_detected = false;
            if (snake.dim == "xy" && a.t == grid_len-1 && b.t == 0) {
                wrap_detected = true;
                all_visible_snake_path_parts.push([b]);
            }
            if (snake.dim == "xt" && a.y == grid_len-1 && b.y == 0) {
                wrap_detected = true;
                all_visible_snake_path_parts.push([b]);
            }
            if (snake.dim == "ty" && a.x == grid_len-1 && b.x == 0) {
                wrap_detected = true;
                all_visible_snake_path_parts.push([b]);
            }
            if (!wrap_detected) {
                all_visible_snake_path_parts[all_visible_snake_path_parts.length-1].push(b);
            }
        }
        this.snake_points_3D = this.get_converted_snake_coords(all_visible_snake_path_parts);

        this.rotateY(0.005);

        this.proj_2D_points =       this.get_projected_2D_cube();
        this.proj_2D_snake_points = this.get_projected_2D_snakepath();
        // debug
        // console.log(this.proj_2D_snake_points[this.proj_2D_snake_points.length-1]); 
    }
    render() {

        // draw the snake points

        for (let ppi = 0; ppi < this.proj_2D_snake_points.length; ppi++) {
            const coords = this.proj_2D_snake_points[ppi];

            console.log(coords)
        
            ctx.beginPath();
            ctx.moveTo(
                cs*(coords[0].cx + this.translate.x), 
                cs*(coords[0].cy + this.translate.y)
                );  
            for (let i = 1; i < this.proj_2D_snake_points.length; i++) {
                ctx.lineTo(
                    cs*(coords[i].cx + this.translate.x), 
                    cs*(coords[i].cy + this.translate.y)
                    );    
            }
            ctx.strokeStyle = "black";
            ctx.stroke();
        }

        // draw the cube
        // kinda copied from https://github.com/pothonprogramming/pothonprogramming.github.io/blob/master/content/cube/cube.html
        for (let index = 0; index < this.faces.length; index++) {

            let face = this.faces[index];

            ctx.beginPath();
            ctx.moveTo(
                cs*(this.proj_2D_points[face[0]].cx + this.translate.x), 
                cs*(this.proj_2D_points[face[0]].cy + this.translate.y)
                );  
            for (let i = 1; i <= 3; i++) {
                ctx.lineTo(
                    cs*(this.proj_2D_points[face[i]].cx + this.translate.x), 
                    cs*(this.proj_2D_points[face[i]].cy + this.translate.y)
                    );    
            }
            ctx.closePath();
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.stroke();
  
        }
    }
}