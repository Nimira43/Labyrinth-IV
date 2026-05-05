export default class GameState {
  constructor() {
    this.health = 100
    this.keysCollected = 0
    this.totalKeys = 5
    this.portalUnlocked = false
  }

  addHealth(amount) {
    this.health = Math.min(100, this.health + amount)
  }

  damage(amount) {
    this.health = Math.max(0, this.health - amount)
  }

  collectKey() {
    this.keysCollected++
    if (this.keysCollected >= this.totalKeys) {
      this.portalUnlocked = true
    }
  }

  reset() {
    this.health = 100
    this.keysCollected = 0
    this.portalUnlocked = false
  }
}
