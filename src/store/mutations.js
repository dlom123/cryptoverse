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
}