var fs = require("fs");
var filePath = './fuckWord.csv';
var fuckWords = {};

var to_FDA = false;
fs.readFile(filePath, function(err, data) {
    if (err) return console.log(err);
    data = data.toString();
    wordArr = data.split("\n");
    // wordArr = ["毛泽东","周恩来"];
    // console.log(wordArr);
    console.log(wordArr);
    if(to_FDA){
    	for (var i = 0, len = wordArr.length; i < len; i++) {
	        var word = wordArr[i].toString();
	        word = word.split("");//["毛","泽","东"]
	        var tempNode = fuckWords;
	        for (var j = 0; j < word.length; j++) {
	        	var key = word[j]; 
	        	tempNode[key] = tempNode[key] || {};
	        	tempNode = tempNode[key];
	        }
	    }
	    // console.log(fuckWords); 
	    fs.writeFileSync('fuckWords.js', JSON.stringify(fuckWords, null));
    }else{
    	for (var i = 0, len = wordArr.length; i < len; i++) {
	        var word = wordArr[i].toString();
	        fuckWords[word] = 1;
	    }
		fs.writeFileSync('fuckWords.js', JSON.stringify(Object.keys(fuckWords), null));
    }
})