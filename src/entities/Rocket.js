import store from '../store'
import { degreesToRadians, round } from "../functions/helpers"

export default function Rocket(ctx, x = 0, y = 0) {
  // Init variables
  this.ctx = ctx
  this.image = {
    small: new Image(),
    large: new Image()
  }
  this.img = null
  this.raf; // Keep track of requestAnimationFrame()
  this.width = 0;
  this.height = 0;
  // State variables
  this.position = { x, y }; // Center of rocket
  this.rotation = 0; // Degrees
  this.speed = 0;
  this.pressedKeys = {};
  this.isLeavingCryptoid = false
  this.isLeavingGalaxy = false
  // Rocket settings
  this.maxSpeed = 4;
  this.boostPower = 0.1; // Acceleration increment
  this.steering = 5; // Rotation sensitivity

  this.spawn = () => {
    /* Loads the rocket image and spawns it on the screen. */
    const rocketImgFiles = require.context(
      "../assets/images/",
      false,
      /.png$/
    )
    this.image.small.src = rocketImgFiles("./rocket-sm.png")
    this.image.large.src = rocketImgFiles("./rocket-lg.png")
    this.image.small.onload = () => {
      // Default to the small rocket for the cryptoverse view
      this.img = this.image.small
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
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

    // Apply changes to rocket state
    this.update()

    // Apply any rotation from turning the rocket
    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.rotate(degreesToRadians(this.rotation))
    this.ctx.translate(-this.position.x, -this.position.y)

    // Draw the rocket to the screen
    this.ctx.drawImage(
      this.img,
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.img.width,
      this.img.height
    )
    this.ctx.restore() // Put the canvas back how we found it
  }

  this.update = () => {
    /*
      Sets the rocket's new position based on current position,
      rotation, and speed.
    */
    const rotationRadians = degreesToRadians(this.rotation);
    this.position.x += Math.sin(rotationRadians) * this.speed;
    this.position.y += -Math.cos(rotationRadians) * this.speed;
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

    // Detect collisions
    this.handleCollisions()

    // Draw updated rocket
    this.draw()

    // Begin the animation loop using this function
    this.raf = requestAnimationFrame(this.move)
  }

  this.turn = (degrees) => {
    /* Applies rotation to the rocket. */

    // Keep the angle within the range of positive 0-360
    this.rotation = (((this.rotation + degrees) % 360) + 360) % 360;

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

    this.speed = 0

    // Stop applying animations while the rocket is not moving
    cancelAnimationFrame(this.raf)
  }

  this.handleCollisions = () => {
    /* Handles rocket Cryptoverse interactions. */

    if (!store.state.currentGalaxy) {
      // The rocket is in the cryptoverse

      // Check whether the rocket has entered a galaxy
      const rocketInGalaxies = store.state.galaxies.filter(galaxy =>
        this.ctx.isPointInPath(galaxy.targetPath, this.position.x, this.position.y)
      )
      if (!this.isLeavingGalaxy) {
        if (rocketInGalaxies.length) {
          // Rocket has entered a galaxy
          this.enterGalaxy(rocketInGalaxies.pop())
        }
      } else {
        // Rocket has just left a galaxy
        if (!rocketInGalaxies.length) {
          // Rocket left the galaxy's target path
          this.isLeavingGalaxy = false
        }
      }

      // Wrap around at edge of screen when the rocket goes out of bounds while in the cryptoverse
      const isOutOfBounds = this.isOutOfBounds()
      if (isOutOfBounds) {
        if (isOutOfBounds.x > this.ctx.canvas.width) {
          // Out of bounds at the right edge
          this.position.x = 0;
        } else if (isOutOfBounds.y < 0) {
          // Out of bounds at the top edge
          this.position.y = this.ctx.canvas.height;
        }
        if (isOutOfBounds.y > this.ctx.canvas.height) {
          // Out of bounds at the bottom edge
          this.position.y = 0;
        } else if (isOutOfBounds.x < 0) {
          // Out of bounds at the left edge
          this.position.x = this.ctx.canvas.width;
        }
      }
    }
    else {
      // The rocket is in a galaxy

      // Check whether the rocket has left the galaxy
      if (this.isOutOfBounds()) {
        this.leaveGalaxy()
      }

      // Check whether the rocket has entered a cryptoid
      const rocketInCryptoid = store.state.cryptoids.filter((cryptoid) => {
        if (cryptoid.targetPath) {
          return this.ctx.isPointInPath(cryptoid.targetPath, this.position.x, this.position.y)
        }
        return null
      });
      if (!this.isLeavingCryptoid) {
        if (rocketInCryptoid.length) {
          // Rocket has entered a cryptoid
          this.enterCryptoid(rocketInCryptoid.pop())
        }
      } else {
        if (!rocketInCryptoid.length) {
          this.leaveCryptoid()
        }
      }
    }
  }

  this.enterGalaxy = (galaxy) => {
    /* Handles the rocket entering a galaxy. */

    // Bring the rocket to a halt
    this.stop()

    // Enter galaxy view
    store.commit('setCurrentGalaxy', galaxy)

    // Use the large rocket image for the zoomed-in galaxy view
    this.changeImage(this.image.large)

    // Move rocket near the edge of the screen on the side it entered
    if (this.rotation >= 45 && this.rotation <= 135) {
      // Entering from the left -- position the rocket accordingly
      this.position.x = 0 + this.width // One rocket's width in from the edge
      this.position.y = this.ctx.canvas.height / 2
      this.rotation = 90
    } else if (this.rotation > 135 && this.rotation < 225) {
      // Entering from the top -- position the rocket accordingly
      this.position.x = this.ctx.canvas.width / 2
      this.position.y = 0 + (this.height / 2) // One rocket's width in from the edge
      this.rotation = 180
    } else if (this.rotation >= 225 && this.rotation <= 315) {
      // Entering from the right -- position the rocket accordingly
      this.position.x = this.ctx.canvas.width - (this.width * 2) // Two rockets' width in from the edge
      this.position.y = this.ctx.canvas.height / 2
      this.rotation = 270
    } else if (this.rotation > 315 || this.rotation < 45) {
      // Entering from the bottom -- position the rocket accordingly
      this.position.x = this.ctx.canvas.width / 2
      this.position.y = this.ctx.canvas.height - (this.height / 2) // One rocket's height in from the edge
      this.rotation = 0
    }
  }

  this.leaveGalaxy = () => {
    /* Handles the rocket leaving a galaxy. */

    this.isLeavingGalaxy = true

    // Bring the rocket to a halt
    this.stop()

    // Leave galaxy view -- return to cryptoverse view
    const galaxy = store.state.currentGalaxy // preserve the galaxy that was exited for later use
    store.commit('setCurrentGalaxy', null)

    // Use the small rocket image for the cryptoverse view
    this.changeImage(this.image.small)

    // Position the rocket at the center of the galaxy it has just left, angled in the direction it exited
    this.position.x = galaxy.coords.x
    this.position.y = galaxy.coords.y
  }

  this.enterCryptoid = (cryptoid) => {
    /* Handles the rocket entering a cryptoid. */

    // Stop the rocket
    this.stop()

    // Show the cryptoid's details
    store.commit('setCurrentCryptoid', cryptoid)

    this.isLeavingCryptoid = true
  }

  this.leaveCryptoid = () => {
    /* Handles the rocket leaving a cryptoid. */

    // Rocket has just left a cryptoid
    this.isLeavingCryptoid = false
  }

  this.isOutOfBounds = () => {
    /* Returns the rocket's x,y coordinates if it is out of bounds, otherwise `false`. */

    return (this.position.x > this.ctx.canvas.width
      || this.position.y < 0
      || this.position.y > this.ctx.canvas.height
      || this.position.x < 0)
      ? { x: this.position.x, y: this.position.y }
      : false
  }

  this.changeImage = (img) => {
    /* Changes the image used to represent the rocket and adjusts width and height accordingly. */

    const d = new Date()
    img.src = `${img.src}?${d.getMilliseconds()}`
    this.img = img
    this.width = img.width
    this.height = img.height
  }

  this.destroy = () => {
    /* Cleans up loose ends. */
    window.removeEventListener('keydown', this.handleKeyboard)
    window.removeEventListener('keyup', this.handleKeyboard)
  }
}
