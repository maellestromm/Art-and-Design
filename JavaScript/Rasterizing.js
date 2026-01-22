import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////

/*
* Maelle McCallum
* 301550046
* CMPT 361 - D100
*/

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) {
  const [x1, y1, color1] = v1;
  const [x2, y2, color2] = v2;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw line

  // Paint the start and end positions
  this.setPixel(Math.floor(x1), Math.floor(y1), color1);
  this.setPixel(Math.floor(x2), Math.floor(y2), color2);
  
  // Initialize commonly computed variables of x and y
  const deltax = x2-x1;
  const deltay = y2-y1;
  const minx = Math.ceil(Math.min(x1,x2));
  const maxx = Math.ceil(Math.max(x1,x2)); 
  const miny = Math.ceil(Math.min(y1,y2));
  const maxy = Math.ceil(Math.max(y1,y2));
  
  // Initialize (and correct if needed) the color of each min/max x and y
  let minxcolor = color1; let maxxcolor = color2;
  if (maxx==x1){  minxcolor = color2; maxxcolor = color1;  }
  let minycolor = color1; let maxycolor = color2;
  if (maxy==y1){  minycolor = color2; maxycolor = color1;  }

// Case 1: slope is infinity
  if (deltax==0){
    // Paint a gradient line from miny to maxy
    for(let yi=miny; yi<=maxy; yi++){
      let colori = this.interpolateColor(maxy-miny,maxy-yi,maxycolor,minycolor);
      this.setPixel(Math.floor(x1), Math.floor(yi), colori);
    }
  }

  else{
    // Calculate the slope of the line
    const m = (y2-y1)/(x2-x1);

// Case 2: slope is 0<abs(m)<=1
    if (Math.abs(m)<=1){
      // Choose the min/max value of y depending on the positive/negative deltax
      let iy=y1;
      if (deltax<0){  iy=y2;  }

      // Paint a gradient line from minx to maxx, incrementing y by the slope
      for (let xi=minx+1; xi<=maxx; xi++){
        iy+=m;
        let colori = this.interpolateColor(maxx-minx,maxx-xi,maxxcolor,minxcolor);
        this.setPixel(Math.floor(xi), Math.floor(iy), colori);
      }  
    }

// Case 3: slope is abs(m)>1
    else{
      // Calculate the inverse of the slope of the line
      const invM = 1/m;

      // Choose the min/max value of x depending on the positive/negative deltay
      let ix=x1;
      if (deltay<0){  ix=x2;  }

      // Paint a gradient line from miny to maxy, incrementing x by the inverse slope
      for(let yi=miny+1; yi<=maxy; yi++){
        ix+=invM;
        let colori = this.interpolateColor(maxy-miny,maxy-yi,maxycolor,minycolor);
        this.setPixel(Math.floor(ix), Math.floor(yi), colori);
      }
    }
  }
}

// Helper function for interpolating color
Rasterizer.prototype.interpolateColor = function(stepstotal,stepsleft,maxcolor,mincolor) {
  // Calculate the fraction of distance travelled
  const fraction = stepsleft / stepstotal;
  
  // Compute new rgb values
  let newr = maxcolor[0]+(fraction*(mincolor[0] - maxcolor[0]));
  let newg = maxcolor[1]+(fraction*(mincolor[1] - maxcolor[1]));
  let newb = maxcolor[2]+(fraction*(mincolor[2] - maxcolor[2]));

  // Return the new color
  return [newr,newg,newb];
}

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v1, v2, v3) {
  const [x0, y0, color1] = v1;
  const [x1, y1, color2] = v2;
  const [x2, y2, color3] = v3;

  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw triangle
  //this.setPixel(Math.floor(x0), Math.floor(y0), color1);
  //this.setPixel(Math.floor(x1), Math.floor(y1), color2);
  //this.setPixel(Math.floor(x2), Math.floor(y2), color3);

  // Compute triangle bounding box
  const xmin = Math.ceil(Math.min(x0,x1,x2));
  const xmax = Math.ceil(Math.max(x0,x1,x2));
  const ymin = Math.ceil(Math.min(y0,y1,y2));
  const ymax = Math.ceil(Math.max(y0,y1,y2));
  const colorp=color1;

  // Test all pixels in bounding box:
  for(let xi=xmin; xi<=xmax; xi++){
    for(let yi=ymin; yi<=ymax; yi++){
      // Check if point is in triangle and compute new color
      let color = this.pointIsInsideTriangle(v1,v2,v3,[xi,yi]);
      if(color!=null){
        // If inside triangle, draw the new pixel
        this.setPixel(Math.floor(xi), Math.floor(yi), color);
      }
    }
  }
}

// Helper function to determine if a pixel is part of a triangle
Rasterizer.prototype.pointIsInsideTriangle = function(v1, v2, v3, p){
  const [x0, y0, color1] = v1;
  const [x1, y1, color2] = v2;
  const [x2, y2, color3] = v3;
  const [x,y] = p;

  // Compute line equations
  const e1 = ((y1-y0)*x)+((x0-x1)*y)+(x1*y0)-(x0*y1);
  const e2 = ((y2-y1)*x)+((x1-x2)*y)+(x2*y1)-(x1*y2);
  const e3 = ((y0-y2)*x)+((x2-x0)*y)+(x0*y2)-(x2*y0);
  const A = Math.abs(((y0-y1)*x2)+((x1-x0)*y2)+(x0*y1)-(x1*y0))/2;

  // Compute new color with barycentric interpolation
  const [u,v,w] = this.barycentricCoordinates(e1,e2,e3,A);
  const newcolor = [(u*color3[0])+(v*color1[0])+(w*color2[0]),
    (u*color3[1])+(v*color1[1])+(w*color2[1]),
    (u*color3[2])+(v*color1[2])+(w*color2[2])];

  // If pixel is within the triangle
  if((e1>0 && e2>0 && e3>0) || e1<0 && e2<0 && e3<0){
    // Return the new pixel color
    return newcolor;
  }

  // Edge cases
  else if(this.edgeCaseIsInsideTriangle(e1,x0,y0,x1,y1) &&
    this.edgeCaseIsInsideTriangle(e2,x1,y1,x2,y2) &&
    this.edgeCaseIsInsideTriangle(e3,x2,y2,x0,y0)){
      // Return the new pixel color
      return newcolor;
  }

  // Otherwise, the pixel is not in the triangle
  else{ return null;  }
}

// Helper function to compute and return barycentric coordinates
Rasterizer.prototype.barycentricCoordinates = function(e1,e2,e3,A){

  // Compute and return the barycentric coordinates
  const u = Math.abs(e1)/ (2*A);
  const v = Math.abs(e2)/ (2*A);
  const w = Math.abs(e3)/ (2*A);
  return [u,v,w];
}

// Helper function to determine if an edge case pixel is a part of a triangle
Rasterizer.prototype.edgeCaseIsInsideTriangle = function(e, x0, y0, x1, y1){
  // Top-left if horizontal 
  const isTopLeft = ((y0 == y1 && x0 < x1) || (y0>y1));

  // If the pixel is within the triangle or a top-left edge case:
  if (e>0 || (e==0 && isTopLeft)){
    return true;
  }

  // Otherwise, it is not in the triangle
  return false;
}



////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////

// Seascape with gulls
const DEF_INPUT = [

  // Sky
  "v,0,0,0.694, 0.898, 0.941;", // sky blue
  "v,64,0,0.694, 0.898, 0.941;",
  "v,0,43,0.89, 0.973, 0.988;", // lighter sky
  "v,64,43,0.89, 0.973, 0.988;",

  "l,0,1;",
  "t,0,1,2;",
  "t,1,2,3;",

  // Horizon
  "v,0,43,0.251, 0.404, 0.451;", // bluer sea
  "v,63,43,0.251, 0.404, 0.451;",
  "l,4,5;",

  // Sea 
  "v,0,63,0.267, 0.412, 0.412;", // greener sea
  "v,63,63,0.267, 0.412, 0.412;",
  "l,4,6;",
  "l,7,6;",
  "l,7,5;",
  "t,4,5,6;",
  "t,7,6,5;",

  // Wave triangle 1
  "v,1,43,0.251, 0.404, 0.451;",  
  "v,32,43,0.435, 0.545, 0.58;",
  "v,63,43,0.251, 0.404, 0.451;",

  "v,32,49,0.251, 0.404, 0.451;",

  "l,8,9;","l,9,10;","l,9,11;",
  "t,8,9,11;","t,11,10,9;",

  // Wave triangle 2
  "v,1,46,0.251, 0.404, 0.451;",  
  "v,32,46,0.435, 0.545, 0.58;",
  "v,63,46,0.251, 0.404, 0.451;",

  "v,32,52,0.251, 0.404, 0.451;",

  "l,12,13;","l,13,14;","l,13,15;",
  "t,12,13,15;","t,15,14,13;",

  // Wave triangle 3
  "v,6,51,0.251, 0.404, 0.451;",  
  "v,32,51,0.435, 0.545, 0.58;",
  "v,57,51,0.251, 0.404, 0.451;",

  "v,32,58,0.267, 0.412, 0.412;",

  "l,16,17;","l,17,18;","l,17,19;",
  "t,16,17,19;","t,19,18,17;",

  // Wave triangle 4
  "v,1,57,0.251, 0.404, 0.451;",  
  "v,32,57,0.435, 0.545, 0.58;",
  "v,63,57,0.251, 0.404, 0.451;",

  "v,32,63,0.267, 0.412, 0.412;",

  "l,20,21;","l,21,22;","l,21,23;",
  "t,20,21,23;","t,23,22,21;",

  
  // Gulls
  "v,11,24,0.753, 0.831, 0.851;",
  "v,18,21,0.753, 0.831, 0.851;",
  "v,14,20,0.929, 0.953, 0.961;",
  "t,24,25,26;",

  "v,15,18,0.753, 0.831, 0.851;",
  "v,22,14,0.753, 0.831, 0.851;",
  "v,18,14,0.929, 0.953, 0.961;",
  "t,27,28,29;",

  "v,21,19,0.753, 0.831, 0.851;",
  "v,28,16,0.753, 0.831, 0.851;",
  "v,24,16,0.929, 0.953, 0.961;",
  "t,30,31,32;",
].join("\n");


// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };
