$(document).ready(function() {
    // variable declarations
    let cardsList = ["fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bolt",
                    "fa-cube", "fa-anchor", "fa-leaf", "fa-bicycle",
                    "fa-diamond", "fa-bomb", "fa-leaf", "fa-bomb", 
                    "fa-bolt", "fa-bicycle", "fa-paper-plane-o", "fa-cube"];
    let shuffledCards = shuffle(cardsList);
    const deck = $('ul.deck');
    const moves = $('span.moves');
    const newGame = $('#newGame');
    const successModal = $('#successModal'); // success modal
    const movesCount = $('#movesCount');
    const timerSelector = $('#timeCount');
    const newGameModal = $('#newGameModal'); // new game modal
    const leaderBoardModal = $('#leaderBoardModal'); // leaderboard modal
    const starsResult = $('#starsResult'); // stars results in the success modals
    const leaderBoard = $('#leaderBoard'); // leader board button 
    const playAgain = $('#playAgain');  // play again button in the success modal
    const lbTableBody = $('#lbTableBody'); // leaderboard table body
    let timer; // timer interval every 1 second
    let timerCount = 0;
    let timerGuard = false; // timer guard to prevent start timer again and it has been already started
    let move = 0;
    let openedCards = [];
    let lastIndex; // last index of clicked cards to prevent click the same card twice
    let matchProgress = 2; // progress of 16 matched cards

    // loop through each card and create its HTML and add it to the page
    function shuffleit() {
        deck.empty();
        for(let i = 0; i < shuffledCards.length; i++) {
            deck.append('<li class="card"><i class="fa ' + shuffledCards[i] + '"></i></li>');
        }
    }

    // call suffle
    shuffleit();
    
    // listen card clicks
    deck.on('click', '.card', function(event) {
        let currentCard = $(this).children('i').attr('class');
        let itemClass = $(this).attr('class').toString();
        let cardIndex = $('.card').index($(this));

        if(openedCards.length < 2 && cardIndex !== lastIndex && itemClass === 'card') {
            move += 1;
            timeRunner();
            displayCards($(this));
            addToOpen(currentCard);
            lastIndex = cardIndex;
            matchCards(currentCard);
            displayMoves();
            starCalc();
        } else {
            lastIndex = cardIndex;
        }

        console.log(openedCards);
        console.log(cardIndex);
        console.log(lastIndex);
    });

    // new game listner
    newGame.click(function(event) {
        resetGame();
    });
    
    // listen to modal open and 
    successModal.on('shown.bs.modal', function () {
        starsResult.html($('ul.stars').html());
        movesCount.text(move);
        timerSelector.text(timerCount);
    });

    // listen to play again button inside the success modal
    playAgain.click(function(event) {
        successModal.modal('hide');
        resetGame();
    });

    // listen to the leader board clicks and get the records from storage and create the HTML
    leaderBoard.click(function(event) {
        leaderBoardModal.modal('show');
        let records = JSON.parse(localStorage.getItem('storeRecords')) || [];
        console.log(records);
        lbTableBody.empty();
        if(records) {
            for(let i = 0; i < records.length; i++) {
                let num = i + 1;
                lbTableBody.append('<tr><th scope="row">' + num +'</th><td><ul class="stars">'+ records[i].stars +'</li></ul></td><td>' + records[i].moves + '</td><td>' + records[i].time + '</td></tr>')
            }
        }
    });
    
    // Shuffle function from http://stackoverflow.com/a/2450976
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    // display cards to deck
    function displayCards(card) {
        card.addClass('open show');
    }

    // add cards to open list
    function addToOpen(card) {
        openedCards.push(card);
    }

    // hide not matched cards
    function hideTempCards(card) {
        if(card === 'match') {
            $('li.card.match').removeClass('open show match animated pulse');
        } else {
            $('li.card.open').removeClass('open show animated wobble bg-danger');
        }
    }

    // check matching progress
    function checkProgress() {
        console.log('progress', matchProgress)
        if(matchProgress === 16) {
            setTimeout(function() {
                winResults();
            }, 400);
        } else {
            matchProgress += 2;
        }
    }

    // matching cards
    function matchCards() {
        if(openedCards.length === 1) {
            $('li.open').addClass('animated flipInX');
            setTimeout(function() {
                $('li.open').removeClass('animated flipInX');
            }, 300);
            return;
        }
        if(openedCards[0] === openedCards[1]) {
            $('li.open').addClass('match animated pulse');
            checkProgress();
            setTimeout(function() {
                lastIndex = -1;
                $('li.open').removeClass('animated pulse');
                resetOpendedCard();
            }, 600);
        } else {
            noMatchCards();
        }
    }

    // cards not matched
    function noMatchCards() {
        $('li.open').addClass('animated wobble bg-danger');
        setTimeout(function() {
            resetOpendedCard();
            lastIndex = -1;
        }, 400);
    }

    // reset opened cards to empty and hide not matched cards
    function resetOpendedCard() {
        openedCards = [];
        hideTempCards('open');
    }

    // display moves to the page.
    function displayMoves() {
        moves.text(move);
    }

    // reset games function
    function resetGame() {
        lastIndex = -1;
        restartModal();
        shuffledCards = shuffle(cardsList);
        shuffleit();
        openedCards = [];
        hideTempCards('open');
        hideTempCards('match');
        move = 0;
        displayMoves();
        matchProgress = 2;
        timerCount = 0;
        $('span.timer').text(0);
        clearTimeRunner();
        resetStars();
    }

    // results modal 
    function winResults() {
        setTimeout(function() {
            successModal.modal('show');
            addRecord();
        }, 200);
        clearTimeRunner();
    }

    // initialize timer
    function timeRunner() {
        if(!timerGuard) {
            timer = setInterval(function() {
                timerCount += 1;
                $('span.timer').text(timerCount);
            }, 1000);
            timerGuard = true;
        }
    }

    // clear timer interval and reset time counter and remove guard
    function clearTimeRunner () {
        clearInterval(timer);
        timerGuard = false;
    }

    // modal transition for new game creation
    function restartModal() {
        newGameModal.modal('show');
        setTimeout(function() {
            newGameModal.modal('hide');
        }, 1000);
    }

    // stars calculation
    function starCalc() {
        if(move === 29) {
            $('#star3').remove();
            $('ul.stars').append('<li id="star3"><i class="fa fa-star-o"></i></li>');
        }
        if(move === 39) {
            $('#star2').remove();
            $('<li id="star2"><i class="fa fa-star-o"></i></li>').insertBefore('#star3');
        }
    }

    // reset stars
    function resetStars() {
        $('ul.stars').empty();
        $('ul.stars').append('<li id="star1"><i class="fa fa-star"></i></li><li id="star2"><i class="fa fa-star"></i></li><li id="star3"><i class="fa fa-star"></i></li>');
    }

    // listen for keyboard shortcuts: n for new game and m for matching all cards
    $('body').keydown(function(event) {
        console.log(event.keyCode);
        if(event.keyCode == 78) { 
            resetGame();
            event.preventDefault(); 
        }
        if(event.keyCode == 77) { 
            $('li.card').addClass('match animated pulse');
            event.preventDefault(); 
        }
    });

    // set record to storage
    function addRecord() {
        let records = JSON.parse(localStorage.getItem('storeRecords')) || [];
        records.push({
            time: timerCount,
            moves: move,
            stars: $('ul.stars').html()
        });
        localStorage.setItem('storeRecords', JSON.stringify(records));
    }
});