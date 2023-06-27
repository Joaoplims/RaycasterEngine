//Data
let data = {
    screen:{
        width : 600,
        height: 300,
        halfWidth: null,
        halfHeight:null
    },
    render:{
        delay :30 // FPS
    },
    rayCasting:{
        incrementAngle:null,
        precision:64
    },
    player:{
        fov:60,
        halfFov: null,
        x : 2, // player x position
        y: 2, // player y postion
        angle: 90, // player view angle
        //Movement Speed properties
        speed:{
            movement: 0.5,
            rotation: 5.0
        }
    },
    map:
    [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,1,0,0,1],
        [1,0,0,1,0,0,1,0,0,1],
        [1,0,0,1,0,0,1,0,0,1],
        [1,0,0,1,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,0,0,1],
        [1,1,1,1,1,1,1,1,1,1],
    ],

    // Input-handling
    key:{
        up: "KeyW",
        down: "KeyS",
        left:"KeyA",
        right: "KeyD"
    },

    textures:[
        {
            width:8,
            height:8,
            bitmap:[
                [1,1,1,1,1,1,1,1],
                [0,0,0,1,0,0,0,1],
                [1,1,1,1,1,1,1,1],
                [0,1,0,0,0,1,0,0],
                [1,1,1,1,1,1,1,1],
                [0,0,0,1,0,0,0,1],
                [1,1,1,1,1,1,1,1],
                [0,1,0,0,0,1,0,0]  
            ],
            colors: [
                "rgb(255,241,232)",
                "rgb(194,195,199)",
            ]
        },

    ]
}

// Initialize calculated values
data.screen.halfWidth= data.screen.width / 2;
data.screen.halfHeight = data.screen.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.screen.width;
data.player.halfFov =data.player.fov/2;

// Canvas Creation
const screen = document.createElement('canvas');
screen.width = data.screen.width;
screen.height = data.screen.height;
screen.style.border = "1px solid black";
document.body.appendChild(screen);

// Set canvas context
const screenCtx = screen.getContext("2d");

//Utilities
function degreeToRadians(degree){
    let pi = Math.PI;
    return degree * pi/180;
}

function drawLine(x1,y1,x2,y2,cssColor){
    screenCtx.strokeStyle = cssColor;
    screenCtx.beginPath();
    screenCtx.moveTo(x1,y1);
    screenCtx.lineTo(x2,y2);
    screenCtx.stroke();
}


// The Raycasting function
function Raycast(){
    let rayAngle = data.player.angle - data.player.halfFov;
    for(let rayCount = 0; rayCount < data.screen.width; rayCount++) {
        
        // Ray data
        let ray = {
            x: data.player.x,
            y: data.player.y
        }

        // Ray path incrementers
        let rayCos = Math.cos(degreeToRadians(rayAngle)) / data.rayCasting.precision;
        let raySin = Math.sin(degreeToRadians(rayAngle)) / data.rayCasting.precision;
        
        // Wall finder
        let wall = 0;
        while(wall == 0) {
     
            ray.x += rayCos;
            ray.y += raySin;
            wall = data.map[Math.floor(ray.y)][Math.floor(ray.x)];
        }
        //console.log(data);

        // Pythagoras theorem
        let distance = Math.sqrt(Math.pow(data.player.x - ray.x, 2) + Math.pow(data.player.y - ray.y, 2));
        // Fish eye fix
        distance = distance * Math.cos(degreeToRadians(rayAngle - data.player.angle));

        // Wall height
        //150/2 = 75
        let wallHeight = Math.floor(data.screen.halfHeight / distance);

        // Get Texture
        let texture = data.textures[wall-1];

        // Calculate texture position
        let texturePositionX = Math.floor((texture.width * (ray.x + ray.y)) % texture.width);
    

        // Sky
        // Base -> where : x1 -> current screen column | y2 -> 0(in the context of html5, 0 is the the further more y coordinate)
        // End -> where : x2 -> current screen column | y2 -> 300/2 150-74(76) ->  the line starts at toppest coordinate position to the 76 y coordinate position
        drawLine(rayCount, 0, rayCount, data.screen.halfHeight - wallHeight, "gray");
        // Wall
        // Base -> where : x1 -> current screen column |y -> 300/2-74(76) -> starts at the end of the sky column
        // End -> where : x2 -> current screen column | y2 -> 300/2+74(224) ->  starts at the end of the sky column and go down to the 224 y position 
        drawTexture(rayCount, wallHeight, texturePositionX, texture);
        // Floor
        // Base -> where : x1 -> current screen column |y -> 300/2+74(76) -> starts at the end of sky column
        // End -> where : x2 -> current screen column | y2 -> 300 -> finishes at the end of the screen size
        drawLine(rayCount, data.screen.halfHeight + wallHeight, rayCount, data.screen.height, "black");

        // Increment
        rayAngle += data.rayCasting.incrementAngle;
    }

}

//Clear the canvas
function clearScreen(){
    screenCtx.clearRect(0,0,data.screen.width, data.screen.height);
}

//Add input handling logic to the document
document.addEventListener('keydown', (event) =>{
    let keyCode = event.code;

    if(keyCode === data.key.up){
        let playerCos = Math.cos(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let playerSin = Math.sin(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let newX = data.player.x + playerCos;
        let newY = data.player.y + playerSin;
        console.log(data.map[Math.floor(newY)][Math.floor(newX)] == 0)
        //Collision Tets
        if(data.map[Math.floor(newY)][Math.floor(newX)] === 0){
            data.player.x = newX;
            data.player.y = newY;
        }
 
    }
    else if (keyCode === data.key.down){
        let playerCos = Math.cos(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let playerSin = Math.sin(degreeToRadians(data.player.angle)) * data.player.speed.movement;
        let newX = data.player.x - playerCos;
        let newY = data.player.y - playerSin;
        console.log(data.map[Math.floor(newY)][Math.floor(newX)] == 0)
        if(data.map[Math.floor(newY)][Math.floor(newX)] === 0){
            data.player.x = newX;
            data.player.y = newY;
        }
        
    }
    else if (keyCode === data.key.left){
        data.player.angle -= data.player.speed.rotation;
    }
    else if (keyCode === data.key.right){
        data.player.angle += data.player.speed.rotation;
    }
})


gameUpdate();
// The game loop
function gameUpdate(){
    setInterval(function() {
        clearScreen();
        Raycast();

    }, data.render.delay);
}

function drawTexture(x,wallHeight, texturePositionX, texture){
    // to know how much we need to increment in each step to render the texture
    // wallHeight*2 -> the total height of the wall in the projection
    // we divide by texture.height to get "strips" of the texture
    let yIncrementer = (wallHeight*2) / texture.height;
    // the draw cursor. each loop we increment this cursor to render the next strip of the texture
    let y = data.screen.halfHeight - wallHeight;

    for (let i = 0; i < texture.height; i++) {
        screenCtx.strokeStyle = texture.colors[texture.bitmap[i][texturePositionX]];
        screenCtx.beginPath();
        screenCtx.moveTo(x, y);
        screenCtx.lineTo(x, y + (yIncrementer + 0.5));
        screenCtx.stroke();
        y += yIncrementer;   
    }
}