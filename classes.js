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
        this.history = [this.get_3d_pos()]; // store the turning points
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
    update() {
        // apply velocity, only if there is space left
        var test_d1 = this.pos.d1 + this.vel.d1;
        var test_d2 = this.pos.d2 + this.vel.d2;
        if (test_d1 >= 0 && test_d1 < grid_len) this.pos.d1 = test_d1;
        if (test_d2 >= 0 && test_d2 < grid_len) this.pos.d2 = test_d2;

        // set the 3D position depending on current dimension
        this.pos_3D = this.get_3d_pos();
    };
    draw_tail() {
        // 

    }
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
        this.points_3D = [
            [this.x - this.size, this.y - this.size, this.z - this.size],
            [this.x + this.size, this.y - this.size, this.z - this.size],
            [this.x + this.size, this.y + this.size, this.z - this.size],
            [this.x - this.size, this.y + this.size, this.z - this.size],
            [this.x - this.size, this.y - this.size, this.z + this.size],
            [this.x + this.size, this.y - this.size, this.z + this.size],
            [this.x + this.size, this.y + this.size, this.z + this.size],
            [this.x - this.size, this.y + this.size, this.z + this.size]
        ];
        this.faces = [
            [0, 1, 2, 3], 
            [0, 4, 5, 1], 
            [1, 5, 6, 2], 
            [3, 2, 6, 7], 
            [0, 3, 7, 4], 
            [4, 7, 6, 5]
        ];
        this.proj_2D_points = this.get_projected_2D();
        this.current_rad = 0;
        this.translate = translate;
    }
    get_projected_2D() {

        var points_2D = [];

        for (let i = 0; i < this.points_3D.length; i++) {
            let v = this.points_3D[i];
            let x = v[0]*(this.focal_len/v[2]);
            let y = v[1]*(this.focal_len/v[2]);

            points_2D.push({cx: x, cy: y});
        }

        return points_2D;

    }
    rotateX(rad) {
        // this.current_rad = (this.current_rad + rad)%(2*Math.PI);
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);
        for (let i = 0; i < this.points_3D.length; i++) {
            let v = this.points_3D[i];
            let y = (v[1] - this.y)*cos - (v[2] - this.z)*sin;
            let z = (v[1] - this.y)*sin + (v[2] - this.z)*cos;
            this.points_3D[i][1] = y + this.y;
            this.points_3D[i][2] = z + this.z;
        }
    }
    rotateY(rad) {
        this.current_rad = (this.current_rad + rad)%(2*Math.PI);
        var cos = Math.cos(this.current_rad);
        var sin = Math.sin(this.current_rad);
        for (let i = 0; i < this.points_3D.length; i++) {
            let v = this.points_3D[i];
            let x = (v[2] - this.z)*sin - (v[0] - this.x)*cos;
            let z = (v[2] - this.z)*cos + (v[0] - this.x)*sin;
            this.points_3D[i][0] = x + this.x;
            this.points_3D[i][2] = z + this.z;
        }
    }
    rotateZ(rad) {
        // this.current_rad = (this.current_rad + rad)%(2*Math.PI);
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);
        for (let i = 0; i < this.points_3D.length; i++) {
            let v = this.points_3D[i];
            let x = (v[2] - this.z)*sin - (v[0] - this.x)*cos;
            let y = (v[1] - this.y)*cos - (v[2] - this.z)*sin;
            this.points_3D[i][0] = x + this.x;
            this.points_3D[i][1] = y + this.y;
        }
    }
    update() {
        this.proj_2D_points = this.get_projected_2D();
    }
    render() {

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