import './autoNightmode.js'
import { resolve } from 'url'

const canvas = document.getElementsByTagName('canvas')[0]
let ctx
let px = 4
let player
let gun

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
		this.width = 20
		this.height = 12
		this.xPos = canvas.width / 2 - this.width
		this.yPos = 80 * px
		this.topWidth = this.width / 4
		this.topHeight = this.height / 1.8
		this.topYPos = this.yPos - this.topHeight
		this.topXPos = this.xPos + this.width / 2 - this.topWidth / 2
		this.gunYPos = this.topYPos - this.topHeight
		this.speed = 4
		this.moving = false
		this.color = '#e5e5e5'
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
		ctx.fillStyle = this.color
		// drawBottom
		ctx.fillRect(this.xPos, this.yPos, this.width, this.height)
		// drawTop
		ctx.fillRect(this.topXPos, this.topYPos, this.topWidth, this.topHeight)
	}
	handleKeyDown(e) {
		if (e.key === 'a' || e.key === 'ArrowLeft') this.moving = 'left'
		if (e.key === 'd' || e.key === 'ArrowRight') this.moving = 'right'
		if (e.key === ' ') gun.startShooting()
	}
	handleKeyUp(e) {
		// only stop moving in direction if keyup matches current direction
		const keyMovesLeft = e.key === 'a' || e.key === 'ArrowLeft'
		const keyMovesRight = e.key === 'd' || e.key === 'ArrowRight'
		if (keyMovesLeft && this.moving === 'left') this.moving = false
		if (keyMovesRight && this.moving === 'right') this.moving = false
		if (e.key === ' ') gun.stopShooting()
	}
}

function tick() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	player.moveIfKeyHeld()
	// player.bulletYPos -= 1
	player.draw()
	requestAnimationFrame(tick)
	gun.tick()
}

async function setupGame() {
	ctx = setupCanvas(canvas)
	let promise = new Promise((res, rej) => {
		player = new Player()
		res('done')
	})
	await promise
	gun = new Gun(player.gunYPos)

	const request = requestAnimationFrame(tick)
	window.addEventListener('keydown', (e) => player.handleKeyDown(e))
	window.addEventListener('keyup', (e) => player.handleKeyUp(e))
}

// this.yPos - this.topHeight
setupGame()

class Gun {
	constructor(yPos) {
		this.yPos = yPos
		this.cooling = false
		this.cooldownTime = 200
		this.bulletSpeed = 5
		this.bullets = {}
		this.bulletColor = '#F52A2A'
		this.bulletWidth = player.topWidth
		this.bulletHeight = player.topHeight / 1.5
	}
	startCooldown() {
		this.cooling = true
		window.setTimeout(() => {
			this.cooling = false
			console.log('cooling done')
			if (this.bulletWaiting) gun.fireBullet()
			this.bulletWaiting = false
		}, this.cooldownTime)
	}
	startShooting() {
		if (this.cooling && !this.shootingInterval) {
			// if a shot is fired before the cooldown has ended, that shot is stored in buffer and will fire once cooldown ends. Only one shot will be stored.
			this.bulletWaiting = true
		} else if (!this.shootingInterval) {
			// For tapping spacebar
			gun.fireBullet()

			// For holding down spacebar
			this.shootingInterval = window.setInterval(() => {
				gun.fireBullet()
			}, this.cooldownTime)
		}
	}
	stopShooting() {
		window.clearInterval(this.shootingInterval)
		this.shootingInterval = undefined
	}
	fireBullet(xPos = player.topXPos) {
		this.startCooldown()
		if (this.bullets[xPos]) {
			// Find unique number to append to duplicated xPos bullet
			for (let i = 0; i < 10; i++) {
				let noXPosAtI = !this.bullets[`${xPos}-${i}`]
				if (noXPosAtI) {
					this.bullets[`${xPos}-${i}`] = this.yPos
					break
				}
			}
		} else {
			this.bullets[xPos] = this.yPos
		}
	}
	drawBullets() {
		ctx.fillStyle = this.bulletColor
		// fillRect for each bullet
		Object.entries(this.bullets).forEach(([ xPos, yPos ]) => {
			const strXPos = xPos.toString()
			// trim -0, -1, -2
			xPos = /([\d.]+)/.exec(strXPos)[0]
			ctx.fillRect(xPos, yPos, this.bulletWidth, this.bulletHeight)
		})
	}
	tick() {
		this.drawBullets()
		// decrease the yPos of every bullet until less than 0; then delete it
		Object.entries(this.bullets).forEach(([ xPos, yPos ]) => {
			if (yPos > 0) {
				this.bullets[xPos] -= this.bulletSpeed
			} else {
				delete this.bullets[xPos]
			}
		})
	}
}
