export default {
  setLoading ({ commit }, payload = true) {
    commit('setLoading', payload)
  },
  resetClients ({ commit }, payload) {
    commit('resetClients', payload)
  },
  setDefaultClients ({ commit }, payload) {
    commit('setDefaultClients', payload)
  },
  addClient ({ commit }, payload) {
    commit('addClient', payload)
  },
  updateClient ({ commit }, payload) {
    commit('updateClient', payload)
  },
  removeClient ({ commit }, payload) {
    commit('removeClient', payload)
  }
}
