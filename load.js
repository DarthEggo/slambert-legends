//Loading all assets here:

var Assets = {};
var loading = 0;

Assets.loadImg = function (name) {
  var img = new Image();
  img.src = name;
  loading += 1;
  img.onload = function () {
    loading -= 1;
    console.log(img);
  }
  return img;
}

//This is the part where we initialize the game:
//We load the loading screen, then we load all the other assets while drawing the loading screen;

var transition = 0;
var loadY = 0;
const MARGIN = WIDTH / 2 - 187;

function drawLoading(t) {
  loadY += t / 10;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(Assets.loading, MARGIN, HEIGHT / 2 -loadY, 374, 238);
}

function loadingProccess() {
  if(transition < 120) {
    if(loading == 0) {
      transition++;
    }
    drawLoading(transition);
    requestAnimationFrame(loadingProccess);
  } else {
    requestAnimationFrame(frame);
  }
}

//Load Images
Assets.loading = new Image();
Assets.loading.src = "assets/graphics/loadingScreen.png";
Assets.loading.onload = function() {
  requestAnimationFrame(loadingProccess);
}

Assets.grass = new Image();
Assets.grass.src = "assets/graphics/tiles/grassland.png";

worldGenerate();
