const Gameboard = (function (size = 3) {
    function createBoard() {
        const board = new Array(size).fill().map(row => new Array(size).fill())
        return board
    }

    let board = createBoard()

    function place(i, j, player) {
        if(!(0<=i && i<size)) return false
        if(!(0<=j && j<size)) return false
        if(board[i][j]) return false
        board[i][j] = player
        return true
    }

    function isFull() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (!board[i][j]) return false
            }
        }
        return true
    }

    function getWinnerRows() {
        for (let row = 0; row < size; row++) {
            const player = board[row][0]
            if (!player) continue
            let winner = player
            for (let i = 1; i < size; i++) {
                if (player !== board[row][i]){
                    winner = null
                    break
                }
            }
            if(winner) return winner
        }
    }

    function getWinnerColumns() {
        for (let col = 0; col < size; col++) {
            const player = board[0][col]
            if (!player) continue
            let winner = player
            for (let i = 1; i < size; i++) {
                if (player !== board[i][col]){
                    winner = null
                    break
                }
            }
            if(winner) return winner
        }
    }

    function getWinnerDiagonals() {
        function checkDiag(x, y, dx, dy){
            const player = board[x][y]
            let i=x, j=y;
            while(0<=i && i<size && 0<=j && j<size){
                if(board[i][j] !== player) return null
                i += dx
                j += dy
            }
            return player
        }
        return checkDiag(0,0,1,1) ?? checkDiag(size-1,0,-1,1)
    }

    function getWinner() {
        return getWinnerRows() ?? getWinnerColumns() ?? getWinnerDiagonals()
    }

    function display(){
        console.log('---------')
        board.forEach(row => {
            row = row.map(player => player?.getSymbol?.() ?? '.')
            console.log(row.join(''))
        })
        console.log('---------')
    }

    function get(i, j){
        return board[i][j]
    }

    function clean(){
        board = createBoard()
    }

    return { place, getWinner, isFull, display, clean, get }
})()

function createPlayer(name, symbol) {
    const getName = () => name
    const getSymbol = () => symbol
    function play(i, j){return Gameboard.place(i, j, this)}
    return { getName, getSymbol, play }
}


const UIBoard = function(){

    function create(){
        const board = document.createElement('div')
        board.classList.add('board')
        function createCell(i, j){
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cell.i = i
            cell.j = j
            cell.put = function(symbol){
                cell.textContent = symbol
                cell.classList.add('disabled')
            }
            return cell
        }

        for(let i=0; i<3; i++){
            for(let j=0; j<3; j++){
                const cell = createCell(i, j)
                board.appendChild(cell)
            }
        }
        document.querySelector('.main').appendChild(board)
    }

    function remove(){
        const board = document.querySelector('.board')
        if(board) board.parentElement.removeChild(board)
    }

    return {create, remove, }
}()

function Message(element){

    function log(text){
        element.innerText = text
    }

    function append(text){
        element.innerText += text
    }

    return {log, append, }
}


const Game = function () {

    function start(){
        const [playerNameA, playerNameB] = Array.from(document.querySelectorAll('.player input')).map(playerInput => playerInput.value)

        const playerA = createPlayer(playerNameA || 'Leo', 'X')
        const playerB = createPlayer(playerNameB || 'Computer', 'O')

        const intro = document.querySelector('.intro')
        intro.style.display = 'none'

        const message = Message(document.querySelector('.message'))
        const players = [playerA, playerB]
        let isGameEnded = false

        restart()

        function restart(){
            UIBoard.remove()
            UIBoard.create()
            const cells = document.querySelectorAll('.cell')

            let i = Math.floor(Math.random()*2)
            let player = players[i]
            message.log(player.getName() + ' turn ' + `(${player.getSymbol()})`)
            
            cells.forEach(cell => {
                cell.addEventListener('click', event => {
                    if(isGameEnded) return;
                    let move = player.play(cell.i, cell.j, player)
                    if(move){
                        cell.put(player.getSymbol())
                        i = (i+1)%2
                        player = players[i]
                        message.log(player.getName() + ' turn ' + `(${player.getSymbol()})`)
                        const winner = Gameboard.getWinner()
                        if(winner){
                            message.log("Winner is " + winner.getName() + "🎉")
                            isGameEnded = true
                            endGame()
                        }else if(Gameboard.isFull()){
                            message.log("Tie")
                            isGameEnded = true
                            endGame()
                        }
                    }
                })

            })
        }


        function endGame(){
            const button = document.createElement('button')
            button.textContent = 'Restart'
            button.classList.add('restart')
            button.onclick = function(){
                button.parentElement.removeChild(button)
                isGameEnded = false
                restart()
            }
            const main = document.querySelector('.main')
            main.appendChild(button)
        }

    }

    function run() {
        console.log('run')
        

        const players = [playerA, playerB]
        let i = 0
        while(true){
            let player = players[i]
            console.log(player.getName() + ' turn')
            let move = false
            do{
                move = player.play(+prompt('x'), +prompt('y'), player)
            }
            while(!move)

            Gameboard.display()
            const winner = Gameboard.getWinner()
            if(winner){
                console.log("Winner is ", winner.getName())
                break
            }else if(Gameboard.isFull()){
                console.log("Tie")
                break
            }
            i = (i+1)%2
        }
        console.log("Game is done")
    }

    return { start }
}()



const players = document.querySelectorAll(".player")

players.forEach(player => {
    const input = player.querySelector('input')
    const button = player.querySelector('button')

    button.addEventListener('click', event => {
        if(!input.value) return;
        if(button.classList.contains('disabled')){
            button.classList.toggle('disabled')
            button.textContent = 'Confirm'
            input.disabled = false
            playButton.check()
        } else {
            button.classList.toggle('disabled')
            button.textContent = 'Edit'
            input.disabled = true;
            playButton.check()
        }

    })
})

const playButton = document.querySelector(".play")
playButton.check = function(){
    const buttons = document.querySelectorAll(".player button")
    const allDisabled = Array.from(buttons).every(button => button.classList.contains('disabled'))
    if(allDisabled){
        this.classList.remove('disabled')
    } else {
        this.classList.add('disabled')
    }
}

playButton.addEventListener('click', event => {
    if(!playButton.classList.contains('disabled')){
        Game.start()
    }
})