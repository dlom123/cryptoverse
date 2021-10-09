import { degreesToRadians, round } from "./helpers"

export default function Rocket(ctx, x = 0, y = 0) {
  // Init variables
  this.img = new Image();
  this.raf; // Keep track of requestAnimationFrame()
  this.width = 0;
  this.height = 0;
  // State variables
  this.position = { x, y }; // Center of rocket
  this.rotation = 0; // Degrees
  this.speed = 0;
  this.pressedKeys = {};
  // Rocket settings
  this.maxSpeed = 5;
  this.boostPower = 0.2; // Acceleration increment
  this.steering = 5; // Rotation sensitivity

  this.spawn = () => {
    /* Loads the rocket image and spawns it on the screen. */
    const rocketFile = require.context(
      "../assets/images/",
      false,
      /.png$/
    )("./rocket.png")
    this.img.src = rocketFile
    this.img.onload = () => {
      this.width = this.img.width
      this.height = this.img.height

      // Draw the rocket
      this.draw()

      // Begin listening for keyboard events for controlling the rocket
      window.addEventListener("keydown", this.handleKeyboard);
      window.addEventListener("keyup", this.handleKeyboard);
    }
  }

  this.draw = () => {
    /* Draws the rocket at its current coordinates and rotation. */

    // Clear the previous animation frame to be redrawn
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Apply changes to rocket state
    this.update()

    // Apply any rotation from turning the rocket
    ctx.save()
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(degreesToRadians(this.rotation))
    ctx.translate(-this.position.x, -this.position.y)

    // Draw the rocket to the screen
    ctx.drawImage(
      this.img,
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height
    )
    ctx.restore() // Put the canvas back how we found it
  }

  this.update = () => {
    /*
      Sets the rocket's new position based on current position,
      rotation, and speed.
      
      Wraps the rocket around the screen when it goes out of bounds.
    */
    const rotationRadians = degreesToRadians(this.rotation);
    this.position.x += Math.sin(rotationRadians) * this.speed;
    this.position.y += -Math.cos(rotationRadians) * this.speed;

    // Wrap around at edge of screen
    if (this.position.x > ctx.canvas.width) {
      this.position.x = 0;
    } else if (this.position.y < 0) {
      this.position.y = ctx.canvas.height;
    }
    if (this.position.y > ctx.canvas.height) {
      this.position.y = 0;
    } else if (this.position.x < 0) {
      this.position.x = ctx.canvas.width;
    }
  }

  this.handleKeyboard = (event) => {
    /* Handles keypresses for controlling the rocket. */
    this.pressedKeys[event.code] = event.type === "keydown";

    if (this.pressedKeys["ArrowLeft"] || this.pressedKeys["KeyA"]) {
      // Turn left
      this.turn(-this.steering);
    }
    if (this.pressedKeys["ArrowRight"] || this.pressedKeys["KeyD"]) {
      // Turn right
      this.turn(this.steering);
    }
    if (this.pressedKeys["ArrowUp"] || this.pressedKeys["KeyW"]) {
      if (this.speed === 0) {
        // Rocket is not moving -- launch it!
        this.launch()
      } else {
        // Rocket is already moving -- accelerate it
        this.boost()
      }
    }
    if (this.pressedKeys["ArrowDown"] || this.pressedKeys["KeyS"]) {
      this.unboost()
      if (this.speed === 0) {
        // Rocket has come to a halt
        this.stop()
      }
    }
  }

  this.launch = () => {
    /* Propels the rocket from a standstill. */
    this.boost() // Give it a little tappy
    this.move() // Begin tracking and applying movements
  }

  this.move = () => {
    /*
      Animation loop function.
      
      Steps: UPDATE -> DRAW -> REPEAT
    */

    // Apply rocket state changes
    this.update()

    // Draw updated rocket
    this.draw()

    // Begin the animation loop using this function
    this.raf = requestAnimationFrame(this.move)
  }

  this.turn = (degrees) => {
    /* Applies rotation to the rocket. */
    this.rotation += degrees;

    // If the rocket is not moving, apply the update manually
    // since animations are not being tracked
    if (this.speed === 0) {
      this.update()
      this.draw()
    }
  }

  this.boost = () => {
    /* Increases the rocket's speed. */

    // Constrain maximum speed to the rocket's max speed
    const newSpeed = Math.min(this.speed + this.boostPower, this.maxSpeed)
    // Round down to 1 decimal place
    this.speed = round(newSpeed, 1)
  }

  this.unboost = () => {
    /* Decreases the rocket's speed. */

    // Constrain minimum speed to 0
    const newSpeed = Math.max(this.speed - this.boostPower, 0)
    // Round down to 1 decimal place
    this.speed = round(newSpeed, 1)
  }

  this.stop = () => {
    /* Places the rocket in an idle state. */

    // Stop applying animations while the rocket is not moving
    cancelAnimationFrame(this.raf)
  }

  this.destroy = () => {
    /* Cleans up loose ends. */
    window.removeEventListener('keydown', this.handleKeyboard)
    window.removeEventListener('keyup', this.handleKeyboard)
  }
}
