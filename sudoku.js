const readLine = require("readline")
const chalk = require('chalk')
const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
})
let board = [[[],[],[]],[[],[],[]],[[],[],[]]]
let hintLocations = []
start()
function start(){
    rl.question("Difficulty (1 = lowest, 2.352 = highest, floats are acceptable. Higher difficulties may be seemingly impossible.): ", (answer) => {
      if(isNaN(Number(answer))) return start()
      if(Number(answer) >= 1 && Number(answer) <= 2.352) return setup(Number(answer))
      return start()
    })
}
function setup(diff){
  for(let i = 0; i < 3; i++){
    for(let j = 0; j < 3; j++){
      for(let k = 0; k < 9; k++){
        board[i][j][k] = (j*3 + Math.floor(i+2/3) + k) % 9 + 1
        hintLocations.push([i, j, k])
      }
    }
  }
  for(let l = 0; l < 42; l++){
    let num1 = ~~(Math.random()*9)+1
    let num2
    do{
      num2 = ~~(Math.random()*9)+1
    }while(num1 == num2)
    for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
        for(let k = 0; k < 9; k++){
          if(board[i][j][k] == num1) board[i][j][k] = num2
          else if(board[i][j][k] == num2) board[i][j][k] = num1
        }
      }
    }
  }
  let hints = 40/diff >= 17 ? 81-(~~(40/diff)) : 64
  let totalHints = hints
  do{
    let {outerRow, outerCol, innerPosition} = {outerRow:~~(Math.random() * 3), outerCol:~~(Math.random() * 3), innerPosition:~~(Math.random() * 9)}
    if(board[outerRow][outerCol][innerPosition] != 0 && board[outerRow][outerCol].filter(e => e == 0).length <= ~~(totalHints-1/diff)){ 
      board[outerRow][outerCol].splice(innerPosition, 1, 0)
      hintLocations.splice(hintLocations.findIndex((element) => element[0] == outerRow && element[1] == outerCol && element[2] == innerPosition),1)
      hints--
    }
  }while(hints > 0)
  print()
  ask()
}
function checkPossible(outerRow, outerCol, innerPosition, num){
  let possible = true
  try{
    if(board[outerRow][outerCol][innerPosition] != 0) return {outerRow:outerRow, outerCol:outerCol, innerPosition:innerPosition, num:num, possible:false}
    for(let i = 0; i < board[outerRow][outerCol].length; i++){
      if(board[outerRow][outerCol][i] == num){ 
        possible = false
        break
      }
    }
  }catch(e){
    return {possible:false}
  }
  if(possible){
    let check = innerPosition/3
    let toCheck = check >= 0 && check < 1 ? [0, 1, 2] : check >= 1 && check < 2 ? [3,4,5] : [6,7,8]
    for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
        if(board[outerRow][i][toCheck[j]] == num){
          possible = false
          break
        }
      }
    }
  }
  if(possible){
    let check = innerPosition/3
    let toCheck = Number.isInteger(check) ? [0,3,6] : check.toString().includes("3") ? [1,4,7] : [2,5,8]
    for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
        if(board[i][outerCol][toCheck[j]] == num){
          possible = false
          break
        }
      }
    }
  }
  return {outerRow:outerRow, outerCol:outerCol, innerPosition:innerPosition, num:num, possible:possible}
}
function print(){
  let str = ""
  for(let l = 0; l < 3; l++){
    for(let j = 0; j < 3; j++){
      for(let k = 0; k < 3; k++){
        str += isAHint(l,j,k) ? chalk.green(board[l][j][k]) + " " : board[l][j][k] == 0 ? chalk.red(board[l][j][k]) + " " : chalk.yellow(board[l][j][k]) + " "
      }
      str += "| "
    }
    str = str.slice(0,-2)
    str += "\n"
    for(let j = 0; j < 3; j++){
      for(let k = 3; k < 6; k++){
        str += isAHint(l,j,k) ? chalk.green(board[l][j][k]) + " " : board[l][j][k] == 0 ? chalk.red(board[l][j][k]) + " " : chalk.yellow(board[l][j][k]) + " "
      }
      str += "| "
    }
    str = str.slice(0,-2)
    str += "\n"
    for(let j = 0; j < 3; j++){
      for(let k = 6; k < 9; k++){
        str += isAHint(l,j,k) ? chalk.green(board[l][j][k]) + " " : board[l][j][k] == 0 ? chalk.red(board[l][j][k]) + " " : chalk.yellow(board[l][j][k]) + " "
      }
      str += "| "
    }
    str = str.slice(0,-2)
    str += "\n\n"
  }
  console.log(str)
}
function isAHint(outerRow, outerCol, innerPosition){
  return hintLocations.some(element => element[0] == outerRow && element[1] == outerCol && element[2] == innerPosition)
}
function boardIsFull(){
  let used = 0
  for(let i = 0; i < 3; i++){
    for(let j = 0; j < 3; j++){
      for(let k = 0; k < 9; k++){
        if(board[i][j][k] != 0) used++
      }
    }
  }
  return used == 81
}
function ask(){
  rl.question("Outer row (1-3):", (outerRow) => {
    if(outerRow > 3 || outerRow < 1) return ask()
    rl.question("Outer column (1-3):", (outerCol) => {
      if(outerCol > 3 || outerCol < 1) return ask()
      rl.question("Inner position (1-9): ", (innerPosition) => {
        if(innerPosition > 9 || innerPosition < 1) return ask()
        rl.question("Number (1-9 0 to remove): ", (num) => {
          if(num > 9 || (num < 1 && num != 0)) return ask()
          if(isAHint(Number(outerRow)-1, Number(outerCol)-1, Number(innerPosition)-1)){ 
            console.log(chalk.red.bold("That's a hint"))
            print()
            return ask()
          }
          if(num == 0){
            board[outerRow-1][outerCol-1].splice(innerPosition-1, 1, Number(num))
            print()
            return ask()
          } 
          let {possible} = checkPossible(Number(outerRow)-1, Number(outerCol)-1, Number(innerPosition)-1, Number(num))
          if(possible) board[outerRow-1][outerCol-1].splice(innerPosition-1, 1, Number(num))
          print()
          if(boardIsFull()) return console.log(chalk.green.bold("YOU'VE WON!"))
          ask()
        })
      })
    })
  })
}