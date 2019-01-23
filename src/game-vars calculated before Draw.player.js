import './autoNightmode.js'
import { resolve } from 'url'

const canvas = document.getElementsByTagName('canvas')[0]
let ctx
let px = 4
let player
let gun
let draw

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

class Draw {
	constructor(playerObj, gunObj) {
		// this.ctx = ctx
		this.playerObj = playerObj
		this.gunObj = gunObj
	}
	player() {
		const { bottomWidth, bottomHeight, topWidth, topHeight, bottomX, bottomY, topX, topY } = this.playerObj
		ctx.fillStyle = this.color
		// drawBottom
		ctx.fillRect(bottomX, bottomY, bottomWidth, bottomHeight)
		// drawTop
		ctx.fillRect(topX, topY, topWidth, topHeight)
	}
	bullets() {
		const { bulletColor, bullets, bulletWidth, bulletHeight } = this.gunObj
		// req VAR ctx
		ctx.fillStyle = bulletColor
		// fillRect for each bullet
		Object.entries(bullets).forEach(([ x, y ]) => {
			const strXPos = x.toString()
			// trim -0, -1, -2
			x = /([\d.]+)/.exec(strXPos)[0]
			// req VAR ctx
			ctx.fillRect(x, y, bulletWidth, bulletHeight)
		})
	}
}

class Player {
	constructor() {
		this.width = 20
		this.height = 12
		this.x = canvas.width / 2 - this.width
		// top y
		// req VAR px
		this.y = 80 * px
		this.bottomWidth = this.width
		this.bottomHeight = this.height
		this.topWidth = this.width / 4
		this.topHeight = this.height / 1.8
		this.bottomX = this.x
		this.bottomY = this.y + this.topHeight
		this.topX = this.x + this.width / 2 - this.topWidth / 2
		this.topY = this.y
		// req VAR canvas

		// this.topHeight = this.height / 1.8
		// this.topYPos = this.y - this.topHeight

		this.gunYPos = this.y

		this.speed = 4
		this.color = '#e5e5e5'

		this.moving = false
	}
	// setTopXPos() {
	// 	this.topXPos = this.x + this.width / 2 - this.topWidth / 2
	// }
	moveLeft() {
		let futurePos = this.x - this.speed
		if (futurePos > 0) this.x = futurePos
		// this.setTopXPos()
	}
	moveRight() {
		let futurePos = this.x + this.speed
		if (futurePos < canvas.width - this.width) this.x = futurePos
		// this.setTopXPos()
	}
	moveIfKeyHeld() {
		if (this.moving !== false) {
			this.moving === 'right' ? this.moveRight() : this.moveLeft()
		}
	}
	handleKeyDown(e) {
		if (e.key === 'a' || e.key === 'ArrowLeft') this.moving = 'left'
		if (e.key === 'd' || e.key === 'ArrowRight') this.moving = 'right'
		// req OBJ gun
		if (e.key === ' ') gun.startShooting()
	}
	handleKeyUp(e) {
		// only stop moving in direction if keyup matches current direction
		const keyMovesLeft = e.key === 'a' || e.key === 'ArrowLeft'
		const keyMovesRight = e.key === 'd' || e.key === 'ArrowRight'
		if (keyMovesLeft && this.moving === 'left') this.moving = false
		if (keyMovesRight && this.moving === 'right') this.moving = false
		// req OBJ gun
		if (e.key === ' ') gun.stopShooting()
	}
}

class Gun {
	constructor(x, y) {
		this.x = x
		this.y = y
		this.cooling = false
		this.cooldownTime = 200
		this.bulletSpeed = 5
		this.bullets = {}
		this.bulletColor = '#F52A2A'
		// req OBJ player
		this.bulletWidth = player.topWidth
		// req OBJ player
		this.bulletHeight = player.topHeight / 1.5
	}
	startCooldown() {
		this.cooling = true
		window.setTimeout(() => {
			this.cooling = false
			// req OBJ gun
			if (this.bulletWaiting) gun.fireBullet()
			this.bulletWaiting = false
		}, this.cooldownTime)
	}
	startShooting() {
		if (this.cooling && !this.shootingInterval) {
			// if a shot is fired before the cooldown has ended, that shot is stored in buffer and will fire once cooldown ends. Only one shot will be stored.
			this.bulletWaiting = true
		} else if (!this.shootingInterval) {
			// req OBJ gun
			// For tapping spacebar
			gun.fireBullet()

			// For holding down spacebar
			this.shootingInterval = window.setInterval(() => {
				// req OBJ gun
				gun.fireBullet()
			}, this.cooldownTime)
		}
	}
	stopShooting() {
		window.clearInterval(this.shootingInterval)
		this.shootingInterval = undefined
	}
	// req OBJ player
	fireBullet() {
		x = this.x
		this.startCooldown()
		if (this.bullets[x]) {
			// Find unique number to append to duplicated x bullet
			for (let i = 0; i < 10; i++) {
				let noXPosAtI = !this.bullets[`${x}-${i}`]
				if (noXPosAtI) {
					this.bullets[`${x}-${i}`] = this.y
					break
				}
			}
		} else {
			this.bullets[x] = this.y
		}
	}
	tick() {
		draw.bullets()
		// decrease the y of every bullet until less than 0; then delete it
		Object.entries(this.bullets).forEach(([ x, y ]) => {
			// if above top of screen, remove
			if (y < 0) {
				delete this.bullets[x]
			} else {
				// if block hit, remove bullet and block
				this.bullets[x] -= this.bulletSpeed
			}
		})
	}
}

class Block {
	constructor() {
		this.x = 10
		this.y = 10
		// this.blockSize = 2
		// array of pixels
		// this.pixels = [ [ 1, 0, 1, 1 ], [ 1, 1, 0, 1 ] ]
		this.pixels = {}
		// to generate blocks, give an x, y, height, width
		// in generating a block, pixel array is filled
		// when bullet reaches a pixel, pixel and bullet are destroyed
	}
	drawPixel(x, y) {
		// req VAR ctx // req VAR px
		ctx.fillRect(x * px, y * px, px, px)
	}
	draw() {
		// req VAR ctx
		ctx.fillStyle = 'white'
		Object.entries(this.pixels).forEach(([ x, yValues ]) => {
			yValues.forEach((y) => {
				// req VAR ctx // req VAR px
				ctx.fillRect(x, y, px, px)
			})
		})
	}
	createBlock(x, y, h, w) {
		// add to pixels array from x and y for given height and width
		// without x and y:
		// for h = 1, w = 1:
		// push([0, 0], [0, 1], [1, 1], [1, 0])
		for (let hI = y; hI < h + y; hI += 1) {
			for (let wI = x; wI < w + x; wI += 1) {
				// this.pixels.push({ [hI]: wI })
				this.pixels[hI] ? this.pixels[hI].push(wI) : (this.pixels[hI] = [])
			}
		}
	}
	destroyBlock(x, y) {
		// this.pixels[y][x] = 0
	}
}

const block = new Block()
block.createBlock(20, 20, 20, 20)

async function setupGame() {
	ctx = setupCanvas(canvas)
	let p1 = new Promise((res, rej) => {
		player = new Player()
		res('done')
	})
	await p1
	let p2 = new Promise((res, rej) => {
		gun = new Gun(player.x, player.gunYPos)
		res('done')
	})
	await p2
	draw = new Draw(player, gun)

	const request = requestAnimationFrame(tick)
	window.addEventListener('keydown', (e) => player.handleKeyDown(e))
	window.addEventListener('keyup', (e) => player.handleKeyUp(e))
}

function tick() {
	// req VAR ctx
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	// req OBJ player
	player.moveIfKeyHeld()
	// req OBJ player
	draw.player()
	requestAnimationFrame(tick)
	// req OBJ gun
	gun.tick()
	// req OBJ block
	block.draw()
}

setupGame()
