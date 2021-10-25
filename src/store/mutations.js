export default {
  setCryptoids: (state, payload) => {
    state.cryptoids = payload
  },
  setCurrentCryptoid: (state, payload) => {
    state.currentCryptoid = payload
  },
  setCurrentGalaxy: (state, payload) => {
    state.currentGalaxy = payload
  },
  setGalaxies: (state, payload) => {
    state.galaxies = payload
  },
  setInventory: (state, payload) => {
    state.inventory = payload
  },
  setRocket: (state, payload) => {
    state.rocket = payload
  },
  setShowInventory: (state, payload) => {
    state.showInventory = payload
  },
  setTotalCryptoids: (state, payload) => {
    state.totalCryptoids = payload
  },
}