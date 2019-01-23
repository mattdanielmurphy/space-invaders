# To Do

## Change Shooting

## 1. Split Into Multiple Files

### Player

## variables
  - speed
  - color
  - moving?

## methods
  - moveLeft
  - moveRight
  - moveIfKeyHeld
  - handleKeyDown(e)
  - handleKeyUp(e)

### Gun
## variables
  - x: need to get from Player, 2 ways to achieve:
    1. when player updates its x pos, it also updates gun's x pos
    2. it has access to player, and can just read the prop
  - bulletSpeed
  - bullets
  - bulletColor
  - bulletWidth
  - bulletHeight
  - cooldownTime
  - cooling?

## methods
  - startCooldown
  - startShooting
  - stopShooting
  - fireBullet
  - tick