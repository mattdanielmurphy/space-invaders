class Player {
	constructor(settings, canvas, gun) {
		this.settings = settings
		this.gun = gun
		this.canvas = canvas
		Object.assign(this, settings)

		this.speed = 4
		this.color = '#e5e5e5'

		this.moving = false
	}
	set xPos(pos) {
		this.bottomX = pos
		this.settings.bottomX = pos
	}
	moveLeft() {
		let futurePos = this.bottomX - this.speed
		if (futurePos > 0) this.xPos = futurePos
	}
	moveRight() {
		let futurePos = this.bottomX + this.speed
		if (futurePos < this.canvas.width - this.bottomWidth) this.xPos = futurePos
	}
	moveIfKeyHeld() {
		if (this.moving !== false) {
			this.moving === 'right' ? this.moveRight() : this.moveLeft()
		}
	}
	handleKeyDown(e) {
		if (e.key === 'a' || e.key === 'ArrowLeft') this.moving = 'left'
		if (e.key === 'd' || e.key === 'ArrowRight') this.moving = 'right'

		if (e.key === ' ') {
			this.gun.startShooting()
		}
	}
	handleKeyUp(e) {
		// only stop moving in direction if keyup matches current direction
		const keyMovesLeft = e.key === 'a' || e.key === 'ArrowLeft'
		const keyMovesRight = e.key === 'd' || e.key === 'ArrowRight'
		if (keyMovesLeft && this.moving === 'left') this.moving = false
		if (keyMovesRight && this.moving === 'right') this.moving = false
		// req OBJ gun
		if (e.key === ' ') this.gun.stopShooting()
	}
}

module.exports = Player
