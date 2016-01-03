var PerlinNoise = function () {

 // Gradients
 this.grad = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
                [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];

  // Permutation of all integers 0-255.
  // Acts like the seed of the randomizing of gradients.
  this.p = [151,160,137,91,90,15,
            131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
            190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
            88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
            77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
            102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
            135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
            5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
            223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
            129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
            251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
            49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
            138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

  // To remove the need for index wrapping, var the permutation table length
  this.perm = [];
  for(var i = 0; i < 512; i++) {
    this.perm[i] = this.p[i & 255];
  }
}

// Calculates the dot product
PerlinNoise.prototype.dot = function(g, x, y, z) {
  return g[0] * x + g[1] * y + g[2] * z;
}

// Linear interpolation
PerlinNoise.prototype.lerp = function(a, b, t) {
  return (1 - t) * a + t * b;
}

// Uses the improved smoothetep function f(x) = 6x^5 - 15x^4 + 10x^3
PerlinNoise.prototype.fade = function(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// 3D Perlin noise
PerlinNoise.prototype.noise3d = function(x, y, z) {

  // Find unit grid cell containing povar
  var X = Math.floor(x),
      Y = Math.floor(y),
      Z = Math.floor(z);

  // Get relative xyz coordinates of povar within that cell
  x = x - X;
  y = y - Y;
  z = z - Z;

  // Wrap the integer cells at 255 (smaller vareger period can be varroduced here)
  X = X & 255;
  Y = Y & 255;
  Z = Z & 255;

  // Calculate a set of eight hashed gradient indices
  var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12;
  var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12;
  var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12;
  var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12;
  var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12;
  var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12;
  var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12;
  var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12;

  // Calculate noise contributions from each of the eight corners
  var n000 = this.dot(this.grad[gi000], x, y, z);
  var n100 = this.dot(this.grad[gi100], x - 1, y, z);
  var n010 = this.dot(this.grad[gi010], x, y - 1, z);
  var n110 = this.dot(this.grad[gi110], x-1, y - 1, z);
  var n001 = this.dot(this.grad[gi001], x, y, z - 1);
  var n101 = this.dot(this.grad[gi101], x-1, y, z - 1);
  var n011 = this.dot(this.grad[gi011], x, y-1, z - 1);
  var n111 = this.dot(this.grad[gi111], x - 1, y - 1, z - 1);

  // Compute the this.fade curve value for each of x, y, z
  var u = this.fade(x);
  var v = this.fade(y);
  var w = this.fade(z);

   // Interpolate along x the contributions from each of the corners
  var nx00 = this.lerp(n000, n100, u);
  var nx01 = this.lerp(n001, n101, u);
  var nx10 = this.lerp(n010, n110, u);
  var nx11 = this.lerp(n011, n111, u);

  // Interpolate the four results along y
  var nxy0 = this.lerp(nx00, nx10, v);
  var nxy1 = this.lerp(nx01, nx11, v);

  // Interpolate the two last results along z
  return this.lerp(nxy0, nxy1, w);
}

// Returns noise in 3 dimensions
PerlinNoise.prototype.noise = function(x, y, z, octaves, persistence) {
    var total = 0;
    var frequency = 1;
    var amplitude = 1;
    var maxValue = 0;
    var noiseFunc;

    for (var i = 0; i < octaves; i++) {
        total += this.noise3d(x * frequency, y * frequency, z * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }
    return total;
}
