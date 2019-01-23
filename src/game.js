import './autoNightmode.js'
const Player = require('./components/player')

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
	constructor(ctx, settings) {
		this.ctx = ctx
		this.settings = settings
		Object.assign(this, settings)
		this.playerColor = '#fff'
	}
	getTopX(bottomX) {
		return Number(bottomX) + this.bottomWidth / 2 - this.topWidth / 2
	}
	drawPlayer() {
		Object.assign(this, this.settings)
		this.ctx.fillStyle = this.playerColor
		this.ctx.fillRect(this.bottomX, this.bottomY, this.bottomWidth, this.bottomHeight)
		this.ctx.fillRect(this.getTopX(this.bottomX), this.topY, this.topWidth, this.topHeight)
	}
	drawBullets() {
		this.ctx.fillStyle = this.bulletColor
		// fillRect for each bullet
		Object.entries(this.settings.bullets).forEach(([ x, y ]) => {
			// trim unique identifiers to get just x pos
			const xPosString = x.toString()
			x = /([\d.]+)/.exec(xPosString)[0]
			this.ctx.fillRect(this.getTopX(x), y, this.bulletWidth, this.bulletHeight)
		})
	}
}

class Gun {
	constructor(settings) {
		Object.assign(this, settings)
		this.settings = settings
		this.cooling = false
	}
	startCooldown() {
		this.cooling = true
		window.setTimeout(() => {
			this.cooling = false
			if (this.bulletWaiting) this.fireBullet()
			this.bulletWaiting = false
		}, this.cooldownTime)
	}
	startShooting() {
		if (this.cooling && !this.shootingInterval) {
			// if shot fired cooldown has ended, shot is stored in buffer (max 1 shot); buffer shot fires once cooldown ends
			this.bulletWaiting = true
		} else if (!this.shootingInterval) {
			// For tapping spacebar
			this.fireBullet()

			// For holding down spacebar
			this.shootingInterval = window.setInterval(() => {
				this.fireBullet()
			}, this.cooldownTime)
		}
	}
	stopShooting() {
		window.clearInterval(this.shootingInterval)
		this.shootingInterval = undefined
	}
	fireBullet() {
		const x = this.settings.bottomX
		this.startCooldown()
		if (this.bullets[x]) {
			// add unique identifier to bullet:
			for (let i = 0; i < 10; i++) {
				let uniqueId = !this.bullets[`${x}-${i}`]
				if (uniqueId) {
					this.bullets[`${x}-${i}`] = this.topY
					break
				}
			}
		} else {
			this.bullets[x] = this.topY
		}
	}
	tick() {
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
		this.settings.bullets = this.bullets
	}
}

async function setupGame() {
	ctx = setupCanvas(canvas)

	const settings = new function() {
		this.bottomWidth = 20
		this.bottomHeight = 12
		this.topWidth = this.bottomWidth / 4
		this.topHeight = this.bottomHeight / 1.8
		this.bottomX = canvas.width / 2 - this.bottomWidth
		this.topY = 80 * px
		this.bottomY = this.topY + this.topHeight
		// Gun settings
		this.cooldownTime = 200
		this.bulletSpeed = 5
		this.bullets = {}
		this.bulletColor = '#F52A2A'
		this.bulletWidth = this.topWidth
		this.bulletHeight = this.topHeight / 1.5
	}()

	await new Promise((resolve) => {
		draw = new Draw(ctx, settings)
		resolve('done')
	})

	await new Promise((resolve) => {
		gun = new Gun(settings)
		resolve('done')
	})

	player = new Player(settings, canvas, gun)

	// TICK

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
	draw.drawPlayer()
	requestAnimationFrame(tick)
	// req OBJ gun
	gun.tick()
	draw.drawBullets()
	// req OBJ block
	block.draw()
}

setupGame()

// class Block {
// 	constructor() {
// 		this.bottomX = 10
// 		this.y = 10
// 		// this.blockSize = 2
// 		// array of pixels
// 		// this.pixels = [ [ 1, 0, 1, 1 ], [ 1, 1, 0, 1 ] ]
// 		this.pixels = {}
// 		// to generate blocks, give an x, y, height, width
// 		// in generating a block, pixel array is filled
// 		// when bullet reaches a pixel, pixel and bullet are destroyed
// 	}
// 	drawPixel(x, y) {
// 		// req VAR ctx // req VAR px
// 		ctx.fillRect(x * px, y * px, px, px)
// 	}
// 	draw() {
// 		// req VAR ctx
// 		ctx.fillStyle = 'white'
// 		Object.entries(this.pixels).forEach(([ x, yValues ]) => {
// 			yValues.forEach((y) => {
// 				// req VAR ctx // req VAR px
// 				ctx.fillRect(x, y, px, px)
// 			})
// 		})
// 	}
// 	createBlock(x, y, h, w) {
// 		// add to pixels array from x and y for given height and width
// 		// without x and y:
// 		// for h = 1, w = 1:
// 		// push([0, 0], [0, 1], [1, 1], [1, 0])
// 		for (let hI = y; hI < h + y; hI += 1) {
// 			for (let wI = x; wI < w + x; wI += 1) {
// 				// this.pixels.push({ [hI]: wI })
// 				this.pixels[hI] ? this.pixels[hI].push(wI) : (this.pixels[hI] = [])
// 			}
// 		}
// 	}
// 	destroyBlock(x, y) {
// 		// this.pixels[y][x] = 0
// 	}
// }

// const block = new Block()
// block.createBlock(20, 20, 20, 20)
