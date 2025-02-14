// Seleciona o elemento <canvas> do DOM
const canvas = document.querySelector("canvas")
// Obtém o contexto 2D do canvas para desenhar
const ctx = canvas.getContext("2d")

// Seleciona o elemento que exibe a pontuação atual
const score = document.querySelector(".score--value")
// Seleciona o elemento que exibe a pontuação final no game over
const finalScore = document.querySelector(".final-score > span")
// Seleciona a tela de menu do jogo
const menu = document.querySelector(".menu-screen")
// Seleciona o botão de jogar
const buttonPlay = document.querySelector(".btn-play")

// Carrega o áudio do jogo
const audio = new Audio("../assets/audio.mp3")

// Define o tamanho de cada bloco da cobrinha e da comida
const size = 30

// Define a posição inicial da cobrinha
const initialPosition = { x: 270, y: 240 }

// Inicializa a cobrinha com a posição inicial
let snake = [initialPosition]

// Função para incrementar a pontuação em 10 pontos
const incrementScore = () => {
    score.innerText = +score.innerText + 10
}

// Função para gerar um número aleatório entre min e max
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

// Função para gerar uma posição aleatória alinhada à grade
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}

// Função para gerar uma cor RGB aleatória
const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

// Define a comida com posição e cor aleatórias
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

// Variáveis para armazenar a direção atual da cobrinha e o ID do loop do jogo
let direction, loopId

// Função para desenhar a comida no canvas
const drawFood = () => {
    const { x, y, color } = food

    // Define propriedades de sombra para efeito visual
    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    // Desenha um quadrado representando a comida
    ctx.fillRect(x, y, size, size)
    // Reseta o efeito de sombra
    ctx.shadowBlur = 0
}

// Função para desenhar a cobrinha no canvas
const drawSnake = () => {
    ctx.fillStyle = "#33db00" // Define a cor padrão da cobrinha

    // Itera sobre cada segmento da cobrinha
    snake.forEach((position, index) => {
        // Define a cor da cabeça da cobrinha
        if (index == snake.length - 1) {
            ctx.fillStyle = "green"
        }

        // Desenha um quadrado para cada segmento
        ctx.fillRect(position.x, position.y, size, size)
    })
}

// Função para mover a cobrinha com base na direção atual
const moveSnake = () => {
    if (!direction) return // Se não há direção definida, não move

    // Obtém a posição da cabeça da cobrinha
    const head = snake[snake.length - 1]

    // Atualiza a posição da cabeça com base na direção
    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    }

    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    }

    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size })
    }

    // Remove o último segmento para simular o movimento
    snake.shift()
}

// Função para desenhar a grade no canvas
const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919" // Define a cor das linhas da grade

    // Desenha linhas verticais e horizontais a cada 30 pixels
    for (let i = 30; i < canvas.width; i += 30) {
        // Desenha linha vertical
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        // Desenha linha horizontal
        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

// Função para verificar se a cobrinha comeu a comida
const chackEat = () => { // Nota: "chackEat" provavelmente deveria ser "checkEat"
    const head = snake[snake.length - 1]

    // Verifica se a cabeça da cobrinha está na mesma posição que a comida
    if (head.x == food.x && head.y == food.y) {
        incrementScore() // Incrementa a pontuação
        snake.push(head) // Adiciona um segmento à cobrinha
        audio.play() // Toca o áudio de comer

        // Gera uma nova posição para a comida
        let x = randomPosition()
        let y = randomPosition()

        // Garante que a nova posição da comida não esteja sobre a cobrinha
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        // Atualiza a posição e a cor da comida
        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

// Função para verificar colisões da cobrinha
const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    // Verifica se a cabeça colidiu com as paredes do canvas
    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    // Verifica se a cabeça colidiu com algum segmento do corpo
    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    // Se houver colisão com parede ou consigo mesma, finaliza o jogo
    if (wallCollision || selfCollision) {
        gameOver()
    }
}

// Função para tratar o fim do jogo
const gameOver = () => {
    direction = undefined // Reseta a direção

    menu.style.display = "flex" // Exibe a tela de menu
    finalScore.innerText = score.innerText // Exibe a pontuação final
    canvas.style.filter = "blur(2px)" // Aplica um efeito de desfoque no canvas
}

// Função principal do loop do jogo
const gameLoop = () => {
    clearInterval(loopId) // Limpa qualquer loop anterior

    ctx.clearRect(0, 0, 600, 600) // Limpa o canvas
    drawGrid() // Desenha a grade
    drawFood() // Desenha a comida
    moveSnake() // Move a cobrinha
    drawSnake() // Desenha a cobrinha
    chackEat() // Verifica se a cobrinha comeu a comida
    checkCollision() // Verifica colisões

    // Chama o gameLoop novamente após 300ms
    loopId = setTimeout(() => {
        gameLoop()
    }, 300)
}

// Inicia o loop do jogo
gameLoop()

// Adiciona um listener para capturar eventos de teclado
document.addEventListener("keydown", ({ key }) => {
    // Atualiza a direção com base na tecla pressionada, evitando direções opostas
    if (key == "ArrowRight" && direction != "left") {
        direction = "right"
    }

    if (key == "ArrowLeft" && direction != "right") {
        direction = "left"
    }

    if (key == "ArrowDown" && direction != "up") {
        direction = "down"
    }

    if (key == "ArrowUp" && direction != "down") {
        direction = "up"
    }
})

// Adiciona um listener para o botão de jogar
buttonPlay.addEventListener("click", () => {
    score.innerText = "00" // Reseta a pontuação
    menu.style.display = "none" // Esconde a tela de menu
    canvas.style.filter = "none" // Remove o efeito de desfoque do canvas

    snake = [initialPosition] // Reinicia a cobrinha
})
