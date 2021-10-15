export default {
  setCurrentGalaxy: (state, payload) => {
    state.currentGalaxy = payload
  },
  setGalaxies: (state, payload) => {
    state.galaxies = payload
  },
  setShowCryptoidDetail: (state, payload) => {
    state.showCryptoidDetail = payload
  }
}