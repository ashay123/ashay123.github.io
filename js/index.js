/*
AI is half smart/half stupid by design. Originally I used the minimax algorithm, but that made for a pretty boring game, always ending in either a tie or a loss. So I made my own AI algorithm. The decision tree looks like this:
	1. Winning move available? ---> 
	2. Will lose next turn without blocking move? ---> 
	3. Choose a move at random
*/

const vm = new Vue({
  el: '#app',
  components: {
		modal: {
			template: '#markerSelect',
			methods: {
        set(marker){
          vm.markers.player = marker;
          vm.markers.computer = marker == 'X' ? 'O' : 'X';
          vm.init('computer');
        }
			}
		}
	},
  data: {
    started: false,
    showModal: false,
    mode: '',
    run: false,

    turn: 'X',

    markers: {
      player: '',
      computer: ''
    },

    game: {
      over: false,
      winner: '',
      draw: false,
    },

    board: [
      [{val:'',bg:''}, {val:'',bg:''}, {val:'',bg:''}],
			[{val:'',bg:''}, {val:'',bg:''}, {val:'',bg:''}],
			[{val:'',bg:''}, {val:'',bg:''}, {val:'',bg:''}]
    ],

    windex: [
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
    	[[2,0], [2,1], [2,2]],
  	  [[0,0], [1,0], [2,0]],
    	[[0,1], [1,1], [2,1]],
    	[[0,2], [1,2], [2,2]],
  		[[0,0], [1,1], [2,2]],
  		[[0,2], [1,1], [2,0]]
     ],
		
		tick: new Audio('https://dl.getdropbox.com/s/kgqqnei0yhv3r8n/219069__annabloom__click1.wav')
  },//DATA

  computed: {
    arr() {
			return this.board.map(x => x.map( y => y.val));
		},

		winArr() {
			return this.windex.map(x => x.map( y => this.board[y[0]][y[1]].val));
		},

    check(){
      const board = this.arr;
      const windex = this.winArr;
      const draw = this.arr.every(x => x.every( y => y != ''));

      const checkWin = windex.forEach((x,ind) => {
        const vector = this.windex[ind];
        let over = false;

        if(x.every(y => y == 'X')){
          this.game.winner = 'X';
          over = true;
        }

        if(x.every(y => y == 'O')){
          this.game.winner = 'O';
          over = true;
        }

        if(draw){
          this.game.draw = true;
          over = true;
        }

        if(over){
          this.run = false;
          this.setWin(vector);
        }
      })
    },

    AIWinMove(){
			let move = '';
			const board = this.board;
			const combos = this.winArr;
			const AI = this.markers.computer;
			const AIStr = AI.repeat(3);
			combos.forEach((x,ind) => {
				if(x.join('') + AI === AIStr){
					let row = combos[ind];
					let col = row.indexOf('');
					let index = this.windex[ind][col];
					let box = board[index[0]][index[1]];
					move = box;
				}
			});
			return move;
		},

		AIBlockMove(){
			let move = '';
			const board = this.board;
			const combos = this.winArr;
			const player = this.markers.player;
			const playStr = player.repeat(3);
			combos.forEach((x,ind) => {
				if(x.join('') + player === playStr){
					let row = combos[ind];
					let col = row.indexOf('');
					let index = this.windex[ind][col];
					let box = board[index[0]][index[1]];
					move = box;
				}
			});
			return move;
		},

		randomMove(){
			const board = this.board;
			let counter = 0;
			const recurse = () => {
				if(counter == 8) return;
				counter++;
				let row = Math.floor(Math.random() * 2);
				let col = Math.floor(Math.random() * 2);
				if(board[row][col].val == ''){
					return board[row][col];
				} else
					return recurse();
			};
			return recurse();
		},

    AI(){
      const win = this.AIWinMove;
      const block = this.AIBlockMove;
      const random = this.randomMove;

      if(win != '')
        return win
      else if(win == '' && block != '')
        return block
      else
        return random
    }
  },//COMPUTED

  methods: {
    init(mode){
      this.reset();
      this.mode = mode;
      this.showModal = false;

      if(mode == 'computer')
        this.turn = this.markers.player;

      this.start();
    },

    start(){
      this.run = true;
      this.started = true;
    },

    reset(){
      this.mode = '';
      this.run = false;
      this.game.over = false;
      this.game.winner = '';
      this.game.draw = false;

      this.board.forEach(x => {
        x.map(y => {y.val = ''; y.bg = ''})
      })
    },

    router(box){
      if(this.mode == 'player')
        this.mark(box);
   
      if(this.mode == 'computer' && box.val == ''){
        this.mark(box);
        setTimeout(() => {
          this.mark(this.AI);
        }, 300)
      }
    },

    mark(box){
      const run = this.run;

      if(box.val == '' && run){
        box.val = this.turn;
        this.turn = this.turn == 'X' ? 'O' : 'X';
        this.check;
      }
    },

    setWin(vector){
      if(!this.game.draw){
        vector.forEach( x => {
          this.board[x[0]][x[1]].bg = 'active'
        })
      }
			
			setTimeout(() => {
				this.game.over = true;
			}, 500)
    }
  }//METHODS
})