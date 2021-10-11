export default {
  resetClients (state) {
    state.clients = []
  },
  setDefaultClients (state) {
    state.clients = [...state.clientsDefault]
  },
  addClient (state, payload) {
    state.clients.push(payload)
  },
  updateClient (state, payload) {
    const clientIndex = state.clients.findIndex((c) => c.id === payload.id)
    state.clients.splice(clientIndex, 1, { ...payload })
  },
  removeClient (state, payload) {
    const clientIndex = state.clients.findIndex((c) => c.id === payload.id)
    state.clients.splice(clientIndex, 1)
  },
  setLoading (state, payload) {
    state.loading = payload
  }
}
