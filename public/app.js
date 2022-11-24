document.addEventListener('DOMContentLoaded', () => {  
  const userGrid = document.querySelector('.grid-user')
  const enemyGrid = document.querySelector('.grid-enemy')
  const displayGrid = document.querySelector('.grid-display')
  const ingr0 = document.querySelector('.ingr0-container')
  const ingr1 = document.querySelector('.ingr1-container')
  const ingr2 = document.querySelector('.ingr2-container')
  const ingr3 = document.querySelector('.ingr3-container')
  const startButton = document.querySelector('#start')
  const rotateButton = document.querySelector('#rotate')
  const resetButton = document.querySelector('#reset')
  const infoDisplay = document.querySelector('#info')
  const setupButtons = document.getElementById('setup-buttons')
  const food = document.querySelectorAll('.food')
  const socket = io();
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
  let p1Score = 0
  let p2Score = 0

  let player1Name = document.querySelector('#player1-name')  
  console.log('sessionstorage player1:',sessionStorage.getItem('player1'))
  if (sessionStorage.getItem('player1') == null) player1Name.innerHTML = 'You'
  else player1Name.innerHTML = sessionStorage.getItem('player1')

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

    socket.on('player-number', numAndStarter => {
      let num = numAndStarter[0]
      let randomStarter = numAndStarter[1]
      if (num === -1) {
        infoDisplay.innerHTML = "The restaurant is full."
      } else {
        playerNum = parseInt(num)
        console.log('playerNum:', playerNum)
        console.log('randomStarter:', randomStarter)
        if(randomStarter !== playerNum) currentPlayer = "enemy"
        console.log('currentPlayer:', currentPlayer)
        socket.emit('check-players')
      }
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
        if(p.ready) {
          playerReady(i)
          if(i !== playerReady) enemyReady = true
        }
      })
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

    socket.emit('player-name', sessionStorage.getItem('player1'))
    socket.on('enemyName', enemyName => {
      let player2Name = document.querySelector('#player2-name')
      if (enemyName == null) {
        player2Name.innerHTML = 'Your Hotpot Enemy'
      } else {           
        sessionStorage.setItem('player2', enemyName)
        player2Name.innerHTML = enemyName     
      }      
      socket.emit('player-name', sessionStorage.getItem('player1'))
    })
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

  function turnColor() {
    if(currentPlayer === 'user') {
      document.querySelector(".p1").style.color = "green";
      document.querySelector(".p2").style.color = "black";
    }
    if(currentPlayer === 'enemy') {
      document.querySelector(".p1").style.color = "black";
      document.querySelector(".p2").style.color = "green";
    }
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
      turnColor()
      startTimer()
    }
  }

  var downloadTimer;
  var timeleft;

  function startTimer() {
    timeleft = 10;
    clearInterval(downloadTimer);
    downloadTimer = setInterval(function(){
      if(timeleft <= 0){
        if(currentPlayer === 'user') {
          currentPlayer = 'enemy'
          turnColor()
          timeleft = 10
        } else {
          if(currentPlayer === 'enemy') {
            currentPlayer = 'user'
            turnColor()
            timeleft = 10
          }
        }
      }
      document.getElementById("progressBar").value = timeleft;
      timeleft -= 1;
    }, 1000);
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready`).classList.toggle('active')
  }

  function playerScore(num) {
    if(parseInt(num) === 0) p1Score += 1
    if(parseInt(num) === 1) p2Score += 1
    document.querySelector(`.p1 .score`).innerHTML = p1Score
    document.querySelector(`.p2 .score`).innerHTML = p2Score
  }

  let ingr0Count = 0
  let ingr1Count = 0
  let ingr2Count = 0
  let ingr3Count = 0

  function revealSquare(classList) {
    console.log(classList)
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
    turnColor()
    startTimer()
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
    startTimer()
    }
  }

  function checkForWins() {
    let enemy = 'enemy'
    if (ingr0Count === 4) {
      infoDisplay.innerHTML = `You found ${enemy}'s aubergine!`
      ingr0Count = 10
      playerScore(0)
    }
    if (ingr1Count === 4) {
      infoDisplay.innerHTML = `You found ${enemy}'s fish!`
      ingr1Count = 10
      playerScore(0)
    }
    if (ingr2Count === 4) {
      infoDisplay.innerHTML = `You found ${enemy}'s meat!`
      ingr2Count = 10
      playerScore(0)
    }
    if (ingr3Count === 4) {
      infoDisplay.innerHTML = `You found ${enemy}'s spring onion!`
      ingr3Count = 10
      playerScore(0)
    }
    if (oppIngr0Count === 4) {
      infoDisplay.innerHTML = `${enemy} found your aubergine!`
      oppIngr0Count = 10
      playerScore(1)
    }
    if (oppIngr1Count === 4) {
      infoDisplay.innerHTML = `${enemy} found your fish!`
      oppIngr1Count = 10
      playerScore(1)
    }
    if (oppIngr2Count === 4) {
      infoDisplay.innerHTML = `${enemy} found your meat!`
      oppIngr2Count = 10
      playerScore(1)
    }
    if (oppIngr3Count === 4) {
      infoDisplay.innerHTML = `${enemy} found your spring onion!`
      oppIngr3Count = 10
      playerScore(1)
    }

    if ((ingr0Count + ingr1Count + ingr2Count + ingr3Count) >= 10) {
      infoDisplay.innerHTML = "YOU WIN"
    }
    if ((oppIngr0Count + oppIngr1Count + oppIngr2Count + oppIngr3Count) >= 10) {
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
    }
  }

  function gameOver() {
    userSquares = []
    enemySquares = []
    isHorizontal = true
    ready = false
    enemyReady = false
    allFoodPlaced = false
    createBoard(userGrid, userSquares)
    createBoard(enemyGrid, enemySquares)
    startMultiPlayer()
    setupButtons.style.display = 'inline'
  }
////

let volume = document.getElementById("volume-slider");
volume.addEventListener("change", function(e) {
    audio.volume = e.currentTarget.value / 100;
})


})
