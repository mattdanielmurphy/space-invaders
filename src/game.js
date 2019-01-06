import './autoNightmode.js'

const canvas = document.getElementsByTagName('canvas')[0]
let ctx
let px = 4

function setupCanvas(canvas) {
	// HiDPI Canvas (https://www.html5rocks.com/en/tutorials/canvas/hidpi/)
	const dpr = window.devicePixelRatio || 1
	const rect = canvas.getBoundingClientRect()
	canvas.width = rect.width * dpr
	canvas.height = rect.height * dpr
	const ctx = canvas.getContext('2d')
	ctx.scale(dpr, dpr)
	return ctx
}

class Player {
	constructor() {
		this.xPos = 1 * px
		this.yPos = 60 * px
		this.width = 20
		this.height = 12
		this.topWidth = this.width / 4
		this.topHeight = this.height / 1.8
		this.topXPos = this.xPos + this.width / 2 - this.topWidth / 2
		this.bulletYPos = this.yPos
		this.speed = 4
		this.moving = false
		this.color = '#e5e5e5'
		this.cooling = false
	}
	setTopXPos() {
		this.topXPos = this.xPos + this.width / 2 - this.topWidth / 2
	}
	moveLeft() {
		let futurePos = this.xPos - this.speed
		if (futurePos > 0) this.xPos = futurePos
		this.setTopXPos()
	}
	moveRight() {
		let futurePos = this.xPos + this.speed
		if (futurePos < canvas.width - this.width) this.xPos = futurePos
		this.setTopXPos()
	}
	moveIfKeyHeld() {
		if (this.moving !== false) {
			this.moving === 'right' ? this.moveRight() : this.moveLeft()
		}
	}
	draw() {
		this.drawPlayer()
		this.drawBullet()
	}
	drawBullet() {
		ctx.fillStyle = 'red'
		let width = this.width / 4
		let height = this.height / 1.8
		ctx.fillRect(this.bulletXPos, this.bulletYPos, width, height)
	}
	drawPlayer() {
		ctx.fillStyle = this.color
		// drawBottom
		ctx.fillRect(this.xPos, this.yPos + this.topHeight, this.width, this.height)
		// drawTop
		ctx.fillRect(this.topXPos, this.yPos, this.topWidth, this.topHeight)
	}
	shoot() {
		this.bulletYPos = this.yPos - this.topHeight
		this.bulletXPos = this.topXPos
	}
	startShooting() {
		if (!this.shootingInterval && !this.cooling) {
			this.shoot()
			this.cooling = true
			window.setTimeout(() => {
				this.cooling = false
			}, 500)
			this.shootingInterval = window.setInterval(() => {
				this.shoot()
			}, 500)
		}
	}
	stopShooting() {
		window.clearInterval(this.shootingInterval)
		this.shootingInterval = undefined
	}
	handleKeyDown(e) {
		if (e.key === 'a' || e.key === 'ArrowLeft') this.moving = 'left'
		if (e.key === 'd' || e.key === 'ArrowRight') this.moving = 'right'
		if (e.key === ' ') this.startShooting()
	}
	handleKeyUp(e) {
		// only stop moving in direction if keyup matches current direction
		const keyMovesLeft = e.key === 'a' || e.key === 'ArrowLeft'
		const keyMovesRight = e.key === 'd' || e.key === 'ArrowRight'
		if (keyMovesLeft && this.moving === 'left') this.moving = false
		if (keyMovesRight && this.moving === 'right') this.moving = false
		if (e.key === ' ') this.stopShooting()
	}
}

function tick() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	player.moveIfKeyHeld()
	player.bulletYPos -= 1
	player.draw()
	requestAnimationFrame(tick)
}

function startClock() {
	const request = requestAnimationFrame(tick)
	window.addEventListener('keydown', (e) => player.handleKeyDown(e))
	window.addEventListener('keyup', (e) => player.handleKeyUp(e))
}

function setupGame() {
	ctx = setupCanvas(canvas)
	startClock()
}

let player = new Player()
setupGame()
