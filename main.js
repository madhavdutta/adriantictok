import './style.css';
import { Howl } from 'howler';

document.addEventListener('DOMContentLoaded', () => {
  // Game state
  let currentPlayer = 'X';
  let gameBoard = ['', '', '', '', '', '', '', '', ''];
  let gameActive = true;
  let soundEnabled = true;
  let moveCount = 0;

  // Sound effects with error handling
  const sounds = {
    click: new Howl({
      src: ['/sounds/click.mp3'],
      volume: 0.5,
      preload: true,
      onloaderror: () => console.error('Error loading click sound')
    }),
    win: new Howl({
      src: ['/sounds/win.mp3'],
      volume: 0.5,
      preload: true,
      onloaderror: () => console.error('Error loading win sound')
    }),
    draw: new Howl({
      src: ['/sounds/draw.mp3'],
      volume: 0.5,
      preload: true,
      onloaderror: () => console.error('Error loading draw sound')
    })
  };

  // DOM elements
  const statusDisplay = document.getElementById('status');
  const cells = document.querySelectorAll('.cell');
  const resetButton = document.getElementById('reset-button');
  const soundToggle = document.getElementById('sound-toggle');
  const playerX = document.querySelector('.player-x');
  const playerO = document.querySelector('.player-o');
  const board = document.getElementById('board');

  // Winning combinations
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // Initialize game
  function initGame() {
    // Add event listeners to cells
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('mouseenter', handleCellHover);
      cell.addEventListener('mouseleave', handleCellLeave);
      
      // Add initial animation
      cell.style.opacity = '0';
      cell.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        cell.style.opacity = '1';
        cell.style.transform = 'scale(1)';
      }, 400 + parseInt(cell.getAttribute('data-index')) * 50);
    });
    
    // Add event listeners to buttons
    resetButton.addEventListener('click', resetGame);
    soundToggle.addEventListener('click', toggleSound);
    
    // Set initial player indicators
    updatePlayerIndicators();
  }

  // Handle cell hover
  function handleCellHover(event) {
    const hoveredCell = event.target;
    const cellIndex = parseInt(hoveredCell.getAttribute('data-index'));
    
    if (gameBoard[cellIndex] === '' && gameActive) {
      hoveredCell.textContent = currentPlayer;
      hoveredCell.style.opacity = '0.4';
    }
  }
  
  // Handle cell leave
  function handleCellLeave(event) {
    const hoveredCell = event.target;
    const cellIndex = parseInt(hoveredCell.getAttribute('data-index'));
    
    if (gameBoard[cellIndex] === '' && gameActive) {
      hoveredCell.textContent = '';
      hoveredCell.style.opacity = '1';
    }
  }

  // Toggle sound
  function toggleSound() {
    soundEnabled = !soundEnabled;
    
    const icon = soundToggle.querySelector('i');
    if (soundEnabled) {
      icon.className = 'fas fa-volume-up';
      soundToggle.setAttribute('title', 'Mute Sound');
    } else {
      icon.className = 'fas fa-volume-mute';
      soundToggle.setAttribute('title', 'Enable Sound');
    }
  }

  // Play sound with error handling
  function playSound(sound) {
    if (soundEnabled && sounds[sound]) {
      try {
        sounds[sound].play();
      } catch (error) {
        console.error(`Error playing ${sound} sound:`, error);
      }
    }
  }

  // Update player indicators
  function updatePlayerIndicators() {
    if (currentPlayer === 'X') {
      playerX.classList.add('active');
      playerO.classList.remove('active');
    } else {
      playerO.classList.add('active');
      playerX.classList.remove('active');
    }
  }

  // Handle cell click
  function handleCellClick(event) {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if cell is already filled or game is not active
    if (gameBoard[cellIndex] !== '' || !gameActive) {
      return;
    }

    // Play click sound
    playSound('click');
    moveCount++;

    // Update game state
    gameBoard[cellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    clickedCell.style.opacity = '1';

    // Add animation
    clickedCell.animate([
      { transform: 'scale(0.8)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 }
    ], {
      duration: 300,
      easing: 'ease-out'
    });

    // Check for win or draw
    if (checkWin()) {
      gameActive = false;
      statusDisplay.textContent = `Player ${currentPlayer} wins!`;
      
      // Play win sound
      playSound('win');
      
      // Add celebration animation to the status
      statusDisplay.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
      ], {
        duration: 500,
        iterations: 2
      });
      
      return;
    }

    if (checkDraw()) {
      gameActive = false;
      statusDisplay.textContent = 'Game ended in a draw!';
      
      // Play draw sound
      playSound('draw');
      return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    
    // Update player indicators
    updatePlayerIndicators();
  }

  // Check for win
  function checkWin() {
    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      if (
        gameBoard[a] !== '' &&
        gameBoard[a] === gameBoard[b] &&
        gameBoard[a] === gameBoard[c]
      ) {
        // Highlight winning cells
        cells[a].classList.add('winning-cell');
        cells[b].classList.add('winning-cell');
        cells[c].classList.add('winning-cell');
        
        // Add winning animation
        [cells[a], cells[b], cells[c]].forEach(cell => {
          cell.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
          ], {
            duration: 500,
            iterations: 2
          });
        });
        
        return true;
      }
    }
    return false;
  }

  // Check for draw
  function checkDraw() {
    return moveCount >= 9;
  }

  // Reset game
  function resetGame() {
    // Play click sound
    playSound('click');
    
    // Add reset animation to the board
    board.animate([
      { opacity: 0.5, transform: 'scale(0.95)' },
      { opacity: 1, transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
    
    // Reset game state
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    moveCount = 0;
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    
    // Reset cells
    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x', 'o', 'winning-cell');
      cell.style.opacity = '1';
    });
    
    // Update player indicators
    updatePlayerIndicators();
  }
  
  // Initialize the game
  initGame();
});
