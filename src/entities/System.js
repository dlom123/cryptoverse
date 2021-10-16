import { Cryptoid } from "../entities";
import { getRandomNumber } from "../functions/helpers";

export default function System(ctx, id, name, repCoin, cryptoids) {
  this.ctx = ctx
  this.id = id
  this.name = name
  this.repCoin = repCoin
  this.cryptoids = cryptoids
  this.orbitalPaths = [] // The orbital outlines along which the cryptoids are positioned

  this.drawBackground = () => {
    const ctxBg = this.ctx.bg
    ctxBg.clearRect(0, 0, ctxBg.canvas.width, ctxBg.canvas.height)

    // Draw an orbital path for each cryptoid.
    ctxBg.save()
    ctxBg.setLineDash([2, 2]);
    ctxBg.strokeStyle = "rgba(47, 141, 255, 0.9)"; // lightblue
    // One fewer orbital paths than there are cryptoids since the representative cryptoid goes in the center
    const numPaths = this.cryptoids.length - 1
    for (let i = 0; i < numPaths; i++) {
      const path = new Path2D()
      const radiusX = 120 + i * 60
      const radiusY = radiusX / 3
      const paddingY = i * 5
      path.ellipse(ctxBg.canvas.width / 2, ctxBg.canvas.height / 2 + paddingY, radiusX, radiusY, 0, 0, Math.PI * 2)
      ctxBg.stroke(path)
      this.orbitalPaths.push({
        path,
        radiusX,
        radiusY,
        paddingY
      })
    }
    ctxBg.restore()
  }

  this.loadCryptoids = () => {
    // Create cryptoid objects
    this.cryptoids = this.cryptoids.map((c, i) => {
      let coords = {
        // Position the first cryptoid (representative) in the center of the system (no orbital path)
        x: this.ctx.bg.canvas.width / 2,
        y: this.ctx.bg.canvas.height / 2
      }
      if (i > 0) {
        const op = this.orbitalPaths[i-1] // Adjust for skipping the representative cryptoid
        const a = getRandomNumber(0, 360) // Use a random angle
        coords.x = (this.ctx.bg.canvas.width / 2) + op.radiusX * Math.cos(a), // The x point along the orbital path
        coords.y = (this.ctx.bg.canvas.height / 2 + op.paddingY) + op.radiusY * Math.sin(a) // The y point along the orbital path
      }
      
      
      const cryptoid = new Cryptoid(
        this.ctx.bg,
        this.ctx.user,
        coords,
        c.name,
        c.symbol,
        c.rank,
        c.filename
        )
        
        return cryptoid
      });
  }

  this.plotCryptoids = () => {
    /* Plots each cryptoid in the system along an orbital path. */
    
    // Plot the representative cryptoid in the center of the system
    const rep = this.cryptoids[0]
    rep.load()

    // Plot the rest of the cryptoids along orbital paths surrounding the representative cryptoid
    this.cryptoids.slice(1).forEach(c => {
      c.load()
    })
  }

  this.generate = () => {
    this.drawBackground()
    this.loadCryptoids()
    this.plotCryptoids() // Draw cryptoids
  }
}
