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
		this.yPos = 10 * px
	}
	moveLeft() {
		this.xPos -= 10
	}
	moveRight() {
		this.xPos += 10
	}
	draw() {
		ctx.fillStyle = '#e5e5e5'
		let width = 20
		let height = 12
		let topWidth = width / 4
		let topHeight = height / 1.8
		ctx.fillRect(this.xPos, this.yPos + topHeight, width, height)
		ctx.fillRect(this.xPos + width / 2 - topWidth / 2, this.yPos, topWidth, topHeight)
	}
}

function handleKeyDown(e) {
	console.log(e.key)
	if (e.key === a || e.key === ArrowLeft) player.moveLeft()
	if (e.key === d || e.key === ArrowRight) player.moveRight()
}

function tick() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	// simulate movement
	player.move()
}

function startClock() {
	const request = requestAnimationFrame(tick)
	player.draw(player.xPos, 10.5)
	window.addEventListener('keydown', handleKeyDown)
}

function setupGame() {
	ctx = setupCanvas(canvas)
	startClock()
}

let player = new Player()
setupGame()
