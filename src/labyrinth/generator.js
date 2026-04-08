export default function generateLabyrinth(w, h) {
  const grid = Array.from({ length: w }, () =>
    Array.from({ length: h }, () => true)
  )

  const width = w % 2 === 0 ? w - 1 : w
  const height = h % 2 === 0 ? h - 1 : h

  const stack = []
  const startX = 1
  const startY = 1

  grid[startX][startY] = false
  stack.push({ x: startX, y: startY })

  const directions = [
    { dx: 2, dy: 0 },
    { dx: -2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: 0, dy: -2 }
  ]

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const { x, y } = current

    const shuffled = directions.slice().sort(() => Math.random() - 0.5)
    let carved = false

    for (const { dx, dy } of shuffled) {
      const nx = x + dx
      const ny = y + dy

      if (
        nx > 0 &&
        nx < width &&
        ny > 0 &&
        ny < height &&
        grid[nx][ny]
      ) {
        grid[x + dx / 2][y + dy / 2] = false
        grid[nx][ny] = false
        stack.push({ x: nx, y: ny })
        carved = true
        break
      }
    }

    if (!carved) stack.pop()
  }

  const extraCarves = Math.floor((w * h) * 0.25)

  for (let i = 0; i < extraCarves; i++) {
    const x = Math.floor(Math.random() * (w - 2)) + 1
    const y = Math.floor(Math.random() * (h - 2)) + 1
    if (grid[x][y]) grid[x][y] = false
  }

  return grid
}


