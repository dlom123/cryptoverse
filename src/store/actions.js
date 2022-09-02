import allCryptoids from "@/data/cryptoids.json"
import inventoryData from "@/data/inventory.json"

export default {
  getInventory: ({ commit }) => {
    const inventory = {
      items: inventoryData.items.map(item => ({
        src: require(`../assets/images/items/${item.src}`)
      })),
      starship: inventoryData.starship,
      worlds: inventoryData.worlds.map(world => ({
        src: require(`../assets/images/cryptoids/${world.src}`)
      }))
    }
    commit('setInventory', inventory);
  },
  getTotalCryptoids: ({ commit }) => {
    const totalCryptoids = allCryptoids.length
    commit('setTotalCryptoids', totalCryptoids)
  }
}