import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BingoGame = () => {
  const [role, setRole] = useState('player');
  const [board, setBoard] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [hasWon, setHasWon] = useState(false);
  const [remainingNumbers, setRemainingNumbers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(1);

  // Initialize the game
  useEffect(() => {
    resetGame();
  }, []);

  // Add middle free space when board changes
  useEffect(() => {
    if (board.length > 0 && role === 'player') {
      const middleNumber = board[2][2];
      setSelectedNumbers(prev => new Set([...prev, middleNumber]));
    }
  }, [board, role]);

  // Generate a random board
  const generateBoard = () => {
    const ranges = [
      { min: 1, max: 15 },   // B
      { min: 16, max: 30 },  // I
      { min: 31, max: 45 },  // N
      { min: 46, max: 60 },  // G
      { min: 61, max: 75 }   // O
    ];

    return ranges.map(range => {
      const numbers = Array.from(
        { length: range.max - range.min + 1 }, 
        (_, i) => i + range.min
      );
      return shuffleArray(numbers).slice(0, 5);
    });
  };

  // Shuffle array using Fisher-Yates
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Call a new number
  const callNumber = () => {
    if (remainingNumbers.length === 0) return;
    
    const index = Math.floor(Math.random() * remainingNumbers.length);
    const number = remainingNumbers[index];
    setCurrentNumber(number);
    setCalledNumbers(prev => [...prev, number]);
    setRemainingNumbers(prev => prev.filter((_, i) => i !== index));
  };

  // Handle cell click for player
  const handleCellClick = (number) => {
    if (role === 'caller') return;
    
    setSelectedNumbers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(number)) {
        newSet.delete(number);
      } else {
        newSet.add(number);
      }
      return newSet;
    });
    checkWin();
  };

  // Check for win conditions
  const checkWin = () => {
    if (role === 'caller') return;

    // Check rows
    for (let i = 0; i < 5; i++) {
      const row = board.map(col => col[i]);
      if (row.every(num => selectedNumbers.has(num))) {
        setHasWon(true);
        return;
      }
    }

    // Check columns
    for (let col of board) {
      if (col.every(num => selectedNumbers.has(num))) {
        setHasWon(true);
        return;
      }
    }

    // Check diagonals
    const diagonal1 = board.map((col, i) => col[i]);
    const diagonal2 = board.map((col, i) => col[4-i]);
    
    if (diagonal1.every(num => selectedNumbers.has(num)) ||
        diagonal2.every(num => selectedNumbers.has(num))) {
      setHasWon(true);
      return;
    }
  };

  // Reset the game
  const resetGame = () => {
    setBoard(generateBoard());
    setSelectedNumbers(new Set());
    setCalledNumbers([]);
    setCurrentNumber(null);
    setHasWon(false);
    setRemainingNumbers(Array.from({ length: 75 }, (_, i) => i + 1));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl mb-4">Bingo Game</CardTitle>
        <div className="flex justify-center space-x-4 border-b pb-4">
          <Button 
            onClick={() => {
              setRole('caller');
              resetGame();
            }}
            className={`w-32 transition-colors duration-200 font-semibold
              ${role === 'caller' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-600 ring-offset-2' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            🎯 Caller
          </Button>
          <Button 
            onClick={() => {
              setRole('player');
              resetGame();
            }}
            className={`w-32 transition-colors duration-200 font-semibold
              ${role === 'player' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-600 ring-offset-2' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            🎮 Player
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Caller View */}
          {role === 'caller' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <label className="font-medium">Number of Players:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={numPlayers}
                  onChange={(e) => {
                    const value = Math.min(50, Math.max(1, parseInt(e.target.value) || 1));
                    setNumPlayers(value);
                  }}
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>

              <div className="flex justify-between items-center">
                <Button 
                  onClick={callNumber}
                  disabled={remainingNumbers.length === 0}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Call Number
                </Button>
                <Button 
                  onClick={resetGame}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  New Game
                </Button>
              </div>

              {currentNumber && (
                <div className="text-center p-6 bg-blue-100 rounded-lg">
                  <span className="text-4xl font-bold">
                    {['B', 'I', 'N', 'G', 'O'][Math.floor((currentNumber - 1) / 15)]}-{currentNumber}
                  </span>
                </div>
              )}

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Called Numbers:</h3>
                <div className="flex flex-wrap gap-2">
                  {calledNumbers.map(number => (
                    <span key={number} className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                      {['B', 'I', 'N', 'G', 'O'][Math.floor((number - 1) / 15)]}-{number}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Player View */}
          {role === 'player' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  onClick={resetGame}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  New Card
                </Button>
              </div>

              {currentNumber && (
                <div className="text-center p-4 bg-blue-100 rounded-lg">
                  <span className="text-2xl font-bold">
                    Last Called: {['B', 'I', 'N', 'G', 'O'][Math.floor((currentNumber - 1) / 15)]}-{currentNumber}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2 mt-4">
                {/* Column Headers */}
                {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                  <div key={letter} className="text-center font-bold text-xl">
                    {letter}
                  </div>
                ))}
                
                {/* Board Cells */}
                {Array.from({ length: 5 }, (_, row) => (
                  board.map((col, colIndex) => {
                    const number = col[row];
                    const isSelected = selectedNumbers.has(number);
                    const isCenterCell = colIndex === 2 && row === 2;
                    
                    return (
                      <button
                        key={`${row}-${colIndex}`}
                        onClick={() => handleCellClick(number)}
                        className={`
                          aspect-square p-2 text-lg font-semibold rounded
                          ${isCenterCell ? 'bg-yellow-400 text-white' :
                            isSelected ? 'bg-green-500 text-white' : 
                            'bg-gray-100 hover:bg-gray-200'}
                          transition-colors duration-200
                        `}
                      >
                        {isCenterCell ? 'FREE' : number}
                      </button>
                    );
                  })
                ))}
              </div>

              {hasWon && (
                <Alert className="bg-green-100 border-green-500">
                  <AlertDescription className="text-center text-xl font-bold text-green-700">
                    BINGO! You've Won! 🎉
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BingoGame;