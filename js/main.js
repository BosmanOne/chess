/*
TODO: (from highest priority to lowest)
- add AI,
- finish interface (options and history),
- add castling (roszada), promotion (zamiana pionka)
- find way to remove repeats in code for calculatePossibleMoves function,

*/

//GLOBALS
var selectedPieceId = "";
var whoseMove = "white";
var board = [];

//SETTINGS
var gameStopped = false;
var kingInCheck = false;

generateBoard(true);
placePiecesOnBoard();
updateBoardDisplay();
updateInterfaceDisplay();

$('.grid-board').on('click', '.piece', function() {
	if (gameStopped === true){
		return;
	}
  var pieceId = $(this).attr("id");
	var boardFieldIndex = board.findIndex(x => x.piece.id == pieceId);
	var pieceColor = board[boardFieldIndex].piece.color;
	
	if (pieceColor == whoseMove){
		if (selectedPieceId === ""){
			selectedPieceId = pieceId;
			$(this).parent().addClass("square-selected");
			var possibleMoves = calculatePossibleMoves(pieceId);
			highlightSquares(possibleMoves);

		}else if (selectedPieceId === pieceId){
			selectedPieceId = "";
			$(this).parent().removeClass("square-selected");
			$(".grid-square").removeClass("square-possible-move");
			return;
		}else{
			return;
		}	
	}
});


$('.grid-board').on('click', '.square-possible-move', function() {
	$(".grid-square").removeClass("square-possible-move");
	$(".grid-square").removeClass("square-selected");

	if (whoseMove == "white"){
		whoseMove = "black";
	}else{
		whoseMove = "white";
	}
	
	var coords = $.grep(this.className.split(" "), function(v, i){
		return v.indexOf('square-coords-') === 0;
	}).join();
	coords = coords.slice(14, 16);
	
	console.log("Moving piece: "+selectedPieceId +" to the: "+coords);
	makeMove(selectedPieceId, coords);

	selectedPieceId = "";	
});



function generateBoard(drawBoardBoolean){
	var xVariables = ["a", "b", "c", "d", "e", "f", "g", "h"];

	for (var i=8; i>0; i--){
		for (var j=1; j<9; j++){
			var fieldName = xVariables[j-1] +i;
			if (i%2 === 0){
				if (j%2 === 0){
					board.push({id: j+""+i, name: fieldName, color: "dark", piece: ""});
					if (drawBoardBoolean === true){
						$(".grid-board").append("<div class='grid-square square-dark square-coords-"+j+""+i +"'></div>");
					}
				}else{
					board.push({id: j+""+i, name: fieldName, color: "light", piece: ""});
					if (drawBoardBoolean === true){
						$(".grid-board").append("<div class='grid-square square-light square-coords-"+j+""+i +"'></div>");
					}
				}
			}else{
				if (j%2 === 0){
					board.push({id: j.toString()+i.toString(), name: fieldName, color: "light", piece: ""});
					if (drawBoardBoolean === true){
						$(".grid-board").append("<div class='grid-square square-light square-coords-"+j+""+i +"'></div>");
					}
				}else{
					if (drawBoardBoolean === true){
						$(".grid-board").append("<div class='grid-square square-dark square-coords-"+j+""+i +"'></div>");
					}
					board.push({id: j+""+i, name: fieldName, color: "dark", piece: ""});
				}
			}
		}
	}
}


function placePiecesOnBoard(){
	//order of top pieces (line without pawns)
	var piecesOrder = ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"];
	var idCounter = 0;
	
	//placing top pieces
	for (var i=1; i<9; i++){
		var fieldId = i.toString()+"8";
		var boardFieldIndex = board.findIndex(x => x.id == fieldId);
		var pieceObj = {id: idCounter, name: piecesOrder[i-1], color: "black"};
		idCounter++;
		board[boardFieldIndex].piece = pieceObj;
	}
	for (var i=1; i<9; i++){
		var fieldId = i.toString()+"7";
		var boardFieldIndex = board.findIndex(x => x.id == fieldId);
		var pieceObj = {id: idCounter, name: "Pawn", color: "black"};
		idCounter++;
		board[boardFieldIndex].piece = pieceObj;
	}
	
	//placing bottom pieces
	for (var i=1; i<9; i++){
		var fieldId = i.toString()+"1";
		var boardFieldIndex = board.findIndex(x => x.id == fieldId);
		var pieceObj = {id: idCounter, name: piecesOrder[8-i], color: "white"};
		idCounter++;
		board[boardFieldIndex].piece = pieceObj;
	}
	for (var i=1; i<9; i++){
		var fieldId = i.toString()+"2";
		var boardFieldIndex = board.findIndex(x => x.id == fieldId);
		var pieceObj = {id: idCounter, name: "Pawn", color: "white"};
		idCounter++;
		board[boardFieldIndex].piece = pieceObj;
	}
}

//updates chesspieces positions on board
function updateBoardDisplay(){
	for (var i=0; i<board.length; i++){
		var squareId = "square-coords-"+board[i].id;
		if (board[i].piece === ""){
			if ($("."+squareId).find('> img').length){
				$("."+squareId).empty();
			}
		}else{
			var pieceId = board[i].piece.id;
			if ($("."+squareId).find("img").attr("id") !== pieceId || $("."+squareId).find('> img').length == 0){
				$("."+squareId).html("<img src='css/chesspieces/"+board[i].piece.color +board[i].piece.name +".png' class='piece' id='"+pieceId +"'>");
			}
		}
	}
}

function updateInterfaceDisplay(status){
	if (status !== undefined){
		$(".display-status").html(status);
	}else{
		$(".display-status").html("Current move: <b>"+whoseMove +"s</b>");
		if (kingInCheck === true){
			$(".display-status").append(", Check")
		}
	}

}

function calculatePossibleMoves(chesspieceId){ //returns all squares where move is possible
	var pieceId = chesspieceId;
	var boardFieldIndex = board.findIndex(x => x.piece.id == pieceId);
	var pieceObj = board[boardFieldIndex].piece;
	
	var squarePosition = board[boardFieldIndex].id;
	var squarePositionX = parseInt(squarePosition.slice(0, 1));
  var squarePositionY = parseInt(squarePosition.slice(1, 2));
	
	var possibleMoves = [];
	
	switch(pieceObj.name){
			
		case "Pawn": 
			if (pieceObj.color === "black"){
				if (squarePositionY === 7){ var n = 2; }else { var n = 1; } //Checking for Pawn first move

				for (var i=1; i<=n; i++){
					if (squarePositionY-1 >= 1){
						var positionToCheck = squarePositionX+""+(squarePositionY-i);
						var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
						if (board[positionToCheckBoardIndex].piece === ""){
							possibleMoves.push(positionToCheck);
						}else{
							break;
						}
					}
				}
				
				var positionsToCheckArray = [];
				if ((squarePositionX-1) >= 1 && (squarePositionY-1) >= 1){
					var positionToCheck = (squarePositionX-1)+""+(squarePositionY-1);
					positionsToCheckArray.push(positionToCheck);
				}
				if ((squarePositionX+1) <= 8 && (squarePositionY-1) >= 1){
					var positionToCheck = (squarePositionX+1)+""+(squarePositionY-1);
					positionsToCheckArray.push(positionToCheck);
				}
				for (var i=0; i<positionsToCheckArray.length; i++){
					var positionToCheckBoardIndex = board.findIndex(x => x.id == positionsToCheckArray[i]);
					if (board[positionToCheckBoardIndex].piece != "" && board[positionToCheckBoardIndex].piece.color === "white"){
						possibleMoves.push(positionsToCheckArray[i]);
					}
				}

			}else if (pieceObj.color === "white"){
				if (squarePositionY === 2){ var n = 2; }else { var n = 1; } //Checking for Pawn first move
				
				for (var i=1; i<=n; i++){
					if (squarePositionY+1 <= 8){
						var positionToCheck = squarePositionX+""+(squarePositionY+i);
						var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
						if (board[positionToCheckBoardIndex].piece === ""){
							possibleMoves.push(positionToCheck);
						}else{
							break;
						}
					}
				}
				
				var positionsToCheckArray = [];
				if ((squarePositionX-1) >= 1 && (squarePositionY+1) <= 8){
					var positionToCheck = (squarePositionX-1)+""+(squarePositionY+1);
					positionsToCheckArray.push(positionToCheck);
				}
				if ((squarePositionX+1) <= 8 && (squarePositionY+1) <= 8){
					var positionToCheck = (squarePositionX+1)+""+(squarePositionY+1);
					positionsToCheckArray.push(positionToCheck);
				}
				for (var i=0; i<positionsToCheckArray.length; i++){
					var positionToCheckBoardIndex = board.findIndex(x => x.id == positionsToCheckArray[i]);
					if (board[positionToCheckBoardIndex].piece != "" && board[positionToCheckBoardIndex].piece.color === "black"){
						possibleMoves.push(positionsToCheckArray[i]);
					}
				}
			}
			break;
			
		case "Rook":
			for (var i=squarePositionX+1; i<=8; i++){
				var positionToCheck = i+""+squarePositionY;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			
			for (var i=squarePositionX-1; i>=1; i--){
				var positionToCheck = i+""+squarePositionY;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			
			for (var i=squarePositionY+1; i<=8; i++){
				var positionToCheck = squarePositionX+""+i;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			
			for (var i=squarePositionY-1; i>=1; i--){
				var positionToCheck = squarePositionX+""+i;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			break;
			
		case "Knight":
			var positionsToCheckArray = [
				[squarePositionX-1, squarePositionY+2],
				[squarePositionX+1, squarePositionY+2],
				[squarePositionX-1, squarePositionY-2],
				[squarePositionX+1, squarePositionY-2],
				[squarePositionX-2, squarePositionY+1],
				[squarePositionX-2, squarePositionY-1],
				[squarePositionX+2, squarePositionY+1],
				[squarePositionX+2, squarePositionY-1],
			];

			var positionsToCheckArray = squareInBoardTest(positionsToCheckArray); //removing squares that are out of board (ie: 0:0, -1:0 etc.)
			
			for (var i = 0; i < positionsToCheckArray.length; i++){
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionsToCheckArray[i]);
				
				if (board[positionToCheckBoardIndex].piece === "" || board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionsToCheckArray[i]);
				}
			}
			break;
			
		case "Bishop":
			
			var i=1;
			while (squarePositionX+i <=8 && squarePositionY+i <=8){
				var positionToCheck = squarePositionX+i +"" +(squarePositionY+i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}			
			
			var i=1;
			while (squarePositionX+i <=8 && squarePositionY-i >=1){
				var positionToCheck = squarePositionX+i +"" +(squarePositionY-i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}			
			
			var i=1;
			while (squarePositionX-i >=1 && squarePositionY-i >=1){
				var positionToCheck = squarePositionX-i +"" +(squarePositionY-i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}			
			
			var i=1;
			while (squarePositionX-i >=1 && squarePositionY+i <= 8){
				var positionToCheck = squarePositionX-i +"" +(squarePositionY+i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}		
			break; 
			
		case "Queen":
			
			for (var i=squarePositionX+1; i<=8; i++){
				var positionToCheck = i+""+squarePositionY;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			
			for (var i=squarePositionX-1; i>=1; i--){
				var positionToCheck = i+""+squarePositionY;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			
			for (var i=squarePositionY+1; i<=8; i++){
				var positionToCheck = squarePositionX+""+i;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			
			for (var i=squarePositionY-1; i>=1; i--){
				var positionToCheck = squarePositionX+""+i;
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
			}
			
			var i=1;
			while (squarePositionX+i <=8 && squarePositionY+i <=8){
				var positionToCheck = squarePositionX+i +"" +(squarePositionY+i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}			
			
			var i=1;
			while (squarePositionX+i <=8 && squarePositionY-i >=1){
				var positionToCheck = squarePositionX+i +"" +(squarePositionY-i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}			
			
			var i=1;
			while (squarePositionX-i >=1 && squarePositionY-i >=1){
				var positionToCheck = squarePositionX-i +"" +(squarePositionY-i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}			
			
			var i=1;
			while (squarePositionX-i >=1 && squarePositionY+i <= 8){
				var positionToCheck = squarePositionX-i +"" +(squarePositionY+i);
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionToCheck);
				
				if (board[positionToCheckBoardIndex].piece === ""){
					possibleMoves.push(positionToCheck);
				}else if(board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionToCheck);
					break;
				}else{
					break;
				}
				i++;
			}		
			break;
			
		case "King":
			var positionsToCheckArray = [
				[squarePositionX+1, squarePositionY],
				[squarePositionX+1, squarePositionY+1],
				[squarePositionX, squarePositionY+1],
				[squarePositionX-1, squarePositionY+1],
				[squarePositionX-1, squarePositionY],
				[squarePositionX-1, squarePositionY-1],
				[squarePositionX, squarePositionY-1],
				[squarePositionX+1, squarePositionY-1],
			];

			var positionsToCheckArray = squareInBoardTest(positionsToCheckArray); //removing squares that are out of board (ie: 0:0, -1:0 etc.)
			
			for (var i = 0; i < positionsToCheckArray.length; i++){
				var positionToCheckBoardIndex = board.findIndex(x => x.id == positionsToCheckArray[i]);
				
				if (board[positionToCheckBoardIndex].piece === "" || board[positionToCheckBoardIndex].piece.color != pieceObj.color){
					possibleMoves.push(positionsToCheckArray[i]);
				}
			}
			break;
			
			
	}
	return possibleMoves;
	
	function squareInBoardTest(arrayOfCoords){
		var resultArray = [];
		
		for (var i = 0; i < arrayOfCoords.length; i++){
			if ((arrayOfCoords[i][0] >= 1 && arrayOfCoords[i][0] <=8) && (arrayOfCoords[i][1] >= 1 && arrayOfCoords[i][1] <= 8)){
				var coords = arrayOfCoords[i][0]+""+arrayOfCoords[i][1];
				resultArray.push(coords);
			}
		}
		return resultArray;
	}
};

function checkForCheck() { //Couldn't find better name, sorry. In chess "check" is when a King is in position of direct reach in opponent's next move. 
	var allPossibleMoves = [];
	if (whoseMove === "white"){
		var kingId = 19;
		for (var i=0; i<= 15; i++){
			var pieceId = i;
			if (board.findIndex(x => x.piece.id == pieceId) != -1){
				var possibleMoves = calculatePossibleMoves(pieceId);
				allPossibleMoves = arrayRemoveDuplicates(allPossibleMoves.concat(possibleMoves));
			}
		}
	}else{
		var kingId = 4;
		for (var i=16; i<= 31; i++){
			var pieceId = i;
			if (board.findIndex(x => x.piece.id == pieceId) != -1){
				var possibleMoves = calculatePossibleMoves(pieceId);
				allPossibleMoves = arrayRemoveDuplicates(allPossibleMoves.concat(possibleMoves));
			}
		}
	}
	
	var kingBoardIndex = board.findIndex(x => x.piece.id == kingId);
	if (kingBoardIndex != -1){
		var kingCoords = board[kingBoardIndex].id;
	}

	if (allPossibleMoves.indexOf(kingCoords) != -1){
		console.log("CHECK");
		kingInCheck = true;
	}else{
		kingInCheck = false;
	}
	
	function arrayRemoveDuplicates(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
			for(var j=i+1; j<a.length; ++j) {
				if(a[i] === a[j])
					a.splice(j--, 1);
			}
    }
    return a;
	}
}

function highlightSquares(arrayOfPositions){
	for (var i=0; i<arrayOfPositions.length; i++){
		var squareDiv = $(".square-coords-"+arrayOfPositions[i]);
		$(squareDiv).addClass("square-possible-move");
	}
}

function makeMove(pieceId, squareCoords){
	var pieceBoardIndex = board.findIndex(x => x.piece.id == pieceId);
	var destinationSquareBoardIndex = board.findIndex(x => x.id == squareCoords);
	
	var pieceObj = board[pieceBoardIndex].piece;
	
	if (board[destinationSquareBoardIndex].piece != ""){
		console.log(board[destinationSquareBoardIndex].piece.color +" " +board[destinationSquareBoardIndex].piece.name +" captured");
	}
	if (board[destinationSquareBoardIndex].piece.name == "King"){
		console.log("END OF GAME, "+board[destinationSquareBoardIndex].piece.color +" Lost");
		gameStopped = true;
		updateInterfaceDisplay("<b>"+pieceObj.color+"</b> player won!");
		
		board[destinationSquareBoardIndex].piece = pieceObj;
		board[pieceBoardIndex].piece = "";
		updateBoardDisplay();
		return;
	}
	
	board[destinationSquareBoardIndex].piece = pieceObj;
	board[pieceBoardIndex].piece = "";

	updateBoardDisplay();
	checkForCheck();
	updateInterfaceDisplay();
}

//debugging function
function placePawnOnBoard(pawnPosition, pawnColor){
	var squarePositionX = parseInt(pawnPosition.slice(0, 1));
  var squarePositionY = parseInt(pawnPosition.slice(1, 2));
	
	if ((squarePositionX >= 1 && squarePositionX <=8) && (squarePositionY >= 1 && squarePositionY <=8)){
		var boardIndex = board.findIndex(x => x.id == pawnPosition);
		board[boardIndex].piece = {id: Math.floor((Math.random() * 1000) + 100), name: "Pawn", color: pawnColor};
	}
	updateBoardDisplay();
}

function restartGame(){
	selectedPieceId = "";
	whoseMove = "white";
	board = [];
	
	generateBoard(false);
	placePiecesOnBoard();
	updateBoardDisplay();
	updateInterfaceDisplay();
	gameStopped = false;
}