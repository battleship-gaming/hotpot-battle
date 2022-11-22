document.addEventListener('DOMContentLoaded', () => {
  const userGrid = document.querySelector('.grid-user')
  const enemyGrid = document.querySelector('.grid-enemy')
  const displayGrid = document.querySelector('.grid-display')
  const food = document.querySelectorAll('.food')
  const ingr0 = document.querySelector('.ingr0-container')
  const ingr1 = document.querySelector('.ingr1-container')
  const ingr2 = document.querySelector('.ingr2-container')
  const ingr3 = document.querySelector('.ingr3-container')
  const startButton = document.querySelector('#start')
  const rotateButton = document.querySelector('#rotate')
  const infoDisplay = document.querySelector('#info')
  const setupButtons = document.getElementById('setup-buttons')
  const userSquares = []
  const enemySquares = []
  let isHorizontal = true
  let isGameOver = false
  let currentPlayer = 'user'
  const width = 8
  let playerNum = 0
  let ready = false
  let enemyReady = false
  let allFoodPlaced = false
  let shotFired = -1
  const foodArray = [
    {
      name: 'ingr0',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'ingr1',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'ingr2',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'ingr3',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    }
  ]

  createBoard(userGrid, userSquares)
  createBoard(enemyGrid, enemySquares)

  startMultiPlayer()

  function startMultiPlayer() {
    const socket = io();

    socket.on('player-number', num => {
      if (num === -1) {
        infoDisplay.innerHTML = "Sorry, the server is full"
      } else {
        playerNum = parseInt(num)
        let randomStarter = (Math.random()>=0.5)? 1 : 0
        if(randomStarter === 1 && playerNum === 0) { // For the first player, it is not guaranteed that they start first
          currentPlayer = "enemy"
        } else {
          currentPlayer = "user"
        }
        console.log(currentPlayer)
        socket.emit('check-players')
      }
    })

    socket.on('player-connection', num => {
      console.log(`Player number ${num} has connected or disconnected`)
      playerConnectedOrDisconnected(num)
    })

    socket.on('enemy-ready', num => {
      enemyReady = true
      playerReady(num)
      if (ready) {
        playGameMulti(socket)
        setupButtons.style.display = 'none'
      }
    })

    socket.on('check-players', players => {
      players.forEach((p, i) => {
        if(p.connected) playerConnectedOrDisconnected(i)
        if(p.ready) {
          playerReady(i)
          if(i !== playerReady) enemyReady = true
        }
      })
    })

    socket.on('timeout', () => {
      infoDisplay.innerHTML = 'You have reached the 10 minute limit'
    })

    startButton.addEventListener('click', () => {
      if(allFoodPlaced) playGameMulti(socket)
      else infoDisplay.innerHTML = "Please place all ships"
    })

    enemySquares.forEach(square => {
      square.addEventListener('click', () => {
        if(currentPlayer === 'user' && ready && enemyReady) {
          shotFired = square.dataset.id
          socket.emit('fire', shotFired)
        }
      })
    })

    socket.on('fire', id => {
      enemyGo(id)
      const square = userSquares[id]
      socket.emit('fire-reply', square.classList)
      playGameMulti(socket)
    })

    socket.on('fire-reply', classList => {
      revealSquare(classList)
      playGameMulti(socket)
    })

    function playerConnectedOrDisconnected(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .connected`).classList.toggle('active')
    }
  }

  function createBoard(grid, squares) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
    }
  }
  
  function rotate() {
    if (isHorizontal) {
      ingr0.classList.toggle('ingr0-container-vertical')
      ingr1.classList.toggle('ingr1-container-vertical')
      ingr2.classList.toggle('ingr2-container-vertical')
      ingr3.classList.toggle('ingr3-container-vertical')
      isHorizontal = false
      return
    }
    if (!isHorizontal) {
      ingr0.classList.toggle('ingr0-container-vertical')
      ingr1.classList.toggle('ingr1-container-vertical')
      ingr2.classList.toggle('ingr2-container-vertical')
      ingr3.classList.toggle('ingr3-container-vertical')
      isHorizontal = true
      return
    }
  }
  rotateButton.addEventListener('click', rotate)

  food.forEach(ship => ship.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragover', dragOver))
  userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
  userSquares.forEach(square => square.addEventListener('drop', dragDrop))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  food.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id
  }))

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragDrop() {
    let shipNameWithLastId = draggedShip.lastChild.id
    let shipClass = shipNameWithLastId.slice(0, -2)
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
    let shipLastId = lastShipIndex + parseInt(this.dataset.id)
    const notAllowedHorizontal = [0,8,16,24,32,40,48,56,1,9,17,25,33,41,49,57,2,10,18,26,34,42,80]
    const notAllowedVertical = [63,62,61,60,59,58,57,56,55,54,53,52,51,50]
    
    let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 8 * lastShipIndex)
    console.log(newNotAllowedHorizontal)
    let newNotAllowedVertical = notAllowedVertical.splice(0, 8 * lastShipIndex)

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

    shipLastId = shipLastId - selectedShipIndex

    if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
      for (let i=0; i < draggedShipLength; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === draggedShipLength - 1) directionClass = 'end'
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
      }

    } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
      for (let i=0; i < draggedShipLength; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === draggedShipLength - 1) directionClass = 'end'
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', 'vertical', directionClass, shipClass)
      }
    } else return

    displayGrid.removeChild(draggedShip)
    if(!displayGrid.querySelector('.food')) allFoodPlaced = true
  }

  function playGameMulti(socket) {
    setupButtons.style.display = 'none'
    if(isGameOver) return
    if(!ready) {
      socket.emit('player-ready')
      ready = true
      playerReady(playerNum)
    }

    if(enemyReady) {
      if(currentPlayer === 'user') {
        infoDisplay.innerHTML = 'Your Go'
      }
      if(currentPlayer === 'enemy') {
        infoDisplay.innerHTML = "Enemy's Go"
      }
    }
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready`).classList.toggle('active')
  }

  let ingr0Count = 0
  let ingr1Count = 0
  let ingr2Count = 0
  let ingr3Count = 0

  function revealSquare(classList) {
    const enemySquare = enemyGrid.querySelector(`div[data-id='${shotFired}']`)
    const obj = Object.values(classList)
    if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) {
      if (obj.includes('ingr0')) ingr0Count++
      if (obj.includes('ingr1')) ingr1Count++
      if (obj.includes('ingr2')) ingr2Count++
      if (obj.includes('ingr3')) ingr3Count++
    }
    if (obj.includes('taken')) {
      enemySquare.classList.add('boom')
    } else {
      enemySquare.classList.add('miss')
    }
    checkForWins()
    currentPlayer = 'enemy'
  }

  let oppIngr0Count = 0
  let oppIngr1Count = 0
  let oppIngr2Count = 0
  let oppIngr3Count = 0


  function enemyGo(square) {
    if (!userSquares[square].classList.contains('boom')) {
      const hit = userSquares[square].classList.contains('taken')
      userSquares[square].classList.add(hit ? 'boom' : 'miss')
      if (userSquares[square].classList.contains('ingr0')) oppIngr0Count++
      if (userSquares[square].classList.contains('ingr1')) oppIngr1Count++
      if (userSquares[square].classList.contains('ingr2')) oppIngr2Count++
      if (userSquares[square].classList.contains('ingr3')) oppIngr3Count++
      checkForWins()
    currentPlayer = 'user'
    infoDisplay.innerHTML = 'Your Go'
    }
  }

  function checkForWins() {
    let enemy = 'enemy'
    if (ingr0Count === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s ingr0`
      ingr0Count = 10
    }
    if (ingr1Count === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s ingr1`
      ingr1Count = 10
    }
    if (ingr2Count === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s ingr2`
      ingr2Count = 10
    }
    if (ingr3Count === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s ingr3`
      ingr3Count = 10
    }
    if (oppIngr0Count === 4) {
      infoDisplay.innerHTML = `${enemy} sunk your ingr0`
      oppIngr0Count = 10
    }
    if (oppIngr1Count === 4) {
      infoDisplay.innerHTML = `${enemy} sunk your ingr1`
      oppIngr1Count = 10
    }
    if (oppIngr2Count === 4) {
      infoDisplay.innerHTML = `${enemy} sunk your ingr2`
      oppIngr2Count = 10
    }
    if (oppIngr3Count === 4) {
      infoDisplay.innerHTML = `${enemy} sunk your ingr3`
      oppIngr3Count = 10
    }

    if ((ingr0Count + ingr1Count + ingr2Count + ingr3Count) === 40) {
      infoDisplay.innerHTML = "YOU WIN"
      gameOver()
    }
    if ((oppIngr0Count + oppIngr1Count + oppIngr2Count + oppIngr3Count) === 40) {
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
      gameOver()
    }
  }

  function gameOver() {
    isGameOver = true
  }
})