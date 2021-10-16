import { Cryptoid } from "../entities";

export default function System(ctx, id, name, repCoin, cryptoids) {
  this.ctx = ctx
  this.id = id
  this.name = name
  this.repCoin = repCoin
  this.cryptoids = cryptoids

  this.plotCryptoids = () => {
    /* Creates a cryptoid object for each cryptoid in the system. */

    this.cryptoids = cryptoids.map((c) => {
      const cryptoid = new Cryptoid(
        this.ctx.bg,
        this.ctx.user,
        c.name,
        c.symbol,
        c.filename
      )
      cryptoid.load()
      return cryptoid
    });
  }

  this.generate = () => {
    console.log(`Loading system ${this.name}...`)
    this.plotCryptoids() // Draw cryptoids
  }
}
