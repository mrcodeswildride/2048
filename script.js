let rows = document.getElementsByClassName(`row`)
let messageParagraph = document.getElementById(`messageParagraph`)

// two-dimensional array to store the numbers on the board
let board = createBlankGrid()

// whether or not numbers should move when arrow key pressed
let movable = true

placeRandomNumber()
placeRandomNumber(true)
document.addEventListener(`keydown`, keyPressed)

function keyPressed(event) {
  event.preventDefault()

  if (movable) {
    if (event.keyCode == 37) { // left arrow
      move(-1, 0, true)
    }
    else if (event.keyCode == 38) { // up arrow
      move(0, -1, true)
    }
    else if (event.keyCode == 39) { // right arrow
      move(1, 0, true)
    }
    else if (event.keyCode == 40) { // down arrow
      move(0, 1, true)
    }
  }
}

// moves all the numbers on the board
// xDirection: -1 for left, 1 for right
// yDirection: -1 for up, 1 for down
// firstTime: true if moving after arrow press, false if moving after combine
// test: true if not actually moving but seeing if can move, false if actually moving
function move(xDirection, yDirection, firstTime, test) {
    if (firstTime && !test) {
      movable = false
    }

    // two-dimensional array that represents how many spaces each number will move
    let spacesGrid = createSpacesGrid(xDirection, yDirection)

    // true if no numbers will move
    let allSpacesZero = areAllSpacesZero(spacesGrid)

    if (!allSpacesZero && !test) {
      // update board array and start animation
      moveNumbers(spacesGrid, xDirection, yDirection)
    }

    if (firstTime) {
      if (allSpacesZero) {
        // combined will be true if at least one pair of numbers combined
        let combined = combine(xDirection, yDirection, test)

        if (combined) {
          if (!test) {
            updatePage()
            move(xDirection, yDirection, false)
          }

          return true // indicates that at least one number moved
        }
        else {
          if (!test) {
            movable = true
          }

          return false // indicates that no numbers moved
        }
      }
      else {
        if (!test) {
          // wait until animation complete to continue
          setTimeout(() => {
            // combined will be true if at least one pair of numbers combined
            let combined = combine(xDirection, yDirection, test)

            if (combined) {
              updatePage()
              setTimeout(move, 100, xDirection, yDirection, false)
            }
            else {
              placeRandomNumberAndCheckGameOver()
            }
          }, 500)
        }

        return true // indicates that at least one number moved
      }
    }
    else {
        if (allSpacesZero) {
          placeRandomNumberAndCheckGameOver()
        }
        else {
          // wait until animation complete to continue
          setTimeout(placeRandomNumberAndCheckGameOver, 500)
        }
    }
}

function createSpacesGrid(xDirection, yDirection) {
  let spacesGrid = createBlankGrid()

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x]) {
        spacesGrid[y][x] = countSpaces(x, y, xDirection, yDirection)
      }
    }
  }

  return spacesGrid
}

function countSpaces(x, y, xDirection, yDirection) {
    let spaces = 0

    // look at the three squares to the left/up/right/down of the specified square
    for (let i = 1; i <= 3; i++) {
      let row = board[y + i * yDirection]

      if (row && row[x + i * xDirection] === null) {
        spaces++
      }
    }

    return spaces
}

function areAllSpacesZero(spacesGrid) {
  for (let y = 0; y < spacesGrid.length; y++) {
    for (let x = 0; x < spacesGrid[y].length; x++) {
      if (spacesGrid[y][x] > 0) {
        return false
      }
    }
  }

  return true
}

function moveNumbers(spacesGrid, xDirection, yDirection) {
    // create a copy of the board array so that the copy can be updated to avoid conflicting changes to the original
    let boardCopy = createBlankGrid()

    // update the copy of the board array
    for (let y = 0; y < spacesGrid.length; y++) {
      for (let x = 0; x < spacesGrid[y].length; x++) {
        if (spacesGrid[y][x] != null) {
          let xSpaces = xDirection * spacesGrid[y][x]
          let ySpaces = yDirection * spacesGrid[y][x]

          boardCopy[y + ySpaces][x + xSpaces] = board[y][x]
          animateNumber(x, y, xSpaces, ySpaces)
        }
      }
    }

    // merge the copy of the board array back to the original
    for (let y = 0; y < boardCopy.length; y++) {
      for (let x = 0; x < boardCopy[y].length; x++) {
        board[y][x] = boardCopy[y][x]
      }
    }
}

function animateNumber(x, y, xSpaces, ySpaces) {
  // get the square div
  let square = rows[y].querySelectorAll(`.square`)[x]

  // get the number div in the square div
  let number = square.querySelector(`.number`)

  // animate moving the number div
  number.style.transform = `translate(${xSpaces * 80}px, ${ySpaces * 80}px)`
}

function combine(xDirection, yDirection, test) {
    let combined = false

    if (xDirection == -1) { // left
      for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length - 1; x++) {
          if (board[y][x] && board[y][x] == board[y][x + 1]) {
            if (!test) {
              board[y][x] *= 2
              board[y][x + 1] = null
            }

            combined = true
          }
        }
      }
    }
    else if (xDirection == 1) { // right
      for (let y = 0; y < board.length; y++) {
        for (let x = board[y].length - 1; x > 0; x--) {
          if (board[y][x] && board[y][x] == board[y][x - 1]) {
            if (!test) {
              board[y][x] *= 2
              board[y][x - 1] = null
            }

            combined = true
          }
        }
      }
    }
    else if (yDirection == -1) { // up
      for (let y = 0; y < board.length - 1; y++) {
        for (let x = 0; x < board[y].length; x++) {
          if (board[y][x] && board[y][x] == board[y + 1][x]) {
            if (!test) {
              board[y][x] *= 2
              board[y + 1][x] = null
            }

            combined = true
          }
        }
      }
    }
    else if (yDirection == 1) { // down
      for (let y = board.length - 1; y > 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
          if (board[y][x] && board[y][x] == board[y - 1][x]) {
            if (!test) {
              board[y][x] *= 2
              board[y - 1][x] = null
            }

            combined = true
          }
        }
      }
    }

    return combined
}

// updates the HTML to reflect the board array
function updatePage() {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      // get the square div
      let square = rows[y].querySelectorAll(`.square`)[x]

      // clear the square div
      square.innerHTML = ``

      if (board[y][x]) {
        // create a number div
        let number = document.createElement(`div`)
        number.classList.add(`number`, `n${board[y][x]}`)
        number.innerHTML = board[y][x]

        // add the number div to the square div
        square.appendChild(number)
      }
    }
  }
}

function placeRandomNumberAndCheckGameOver() {
  if (isWin()) {
    messageParagraph.innerHTML = `Good job!`
  }
  else {
    placeRandomNumber()

    if (!canMove()) {
      messageParagraph.innerHTML = `You lose`
    }
    else {
      movable = true
    }
  }
}

function placeRandomNumber(canBe4) {
  let x
  let y

  // pick a random square, and continue doing so until a blank square is picked
  do {
    x = Math.floor(Math.random() * 4)
    y = Math.floor(Math.random() * 4)
  }
  while (board[y][x])

  // put a number in the random square
  if (canBe4) {
    board[y][x] = Math.floor(Math.random() * 4) == 0 ? 4 : 2
  }
  else {
    board[y][x] = 2
  }

  // update the HTML
  updatePage()
}

function isWin() {
  // check if there is a 2048 tile
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] == 2048) {
        return true
      }
    }
  }

  return false
}

function canMove() {
  // try to move (but not actually move) in every direction
  // return true if can move in at least one direction
  return move(-1, 0, true, true) || move(0, -1, true, true) || move(1, 0, true, true) || move(0, 1, true, true)
}

function createBlankGrid() {
  return [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ]
}