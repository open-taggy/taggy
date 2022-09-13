// module.exports = function taggy() {
//   return "this is where it starts. ";
// };
var tokenizer = require("wink-tokenizer");
const stopwords = require("stopwords-iso"); // object of stopwords for multiple languages
const stopwordsDE = stopwords.de; // german stopwords

var winkTokenizer = tokenizer();

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("Input: ", (input) => {
  console.log(`Tokens for "${input}":`);
  tokenizedItems = winkTokenizer.tokenize(input);

  var tokenizedWords = tokenizedItems.filter((item) => {
    return item.tag === "word";
  });
  console.log(tokenizedItems);
  console.log(tokenizedWords);

  //   var tokenizedWordsNoStop = tokenizedWords.filter((item) => {
  //     return;
  //   });
  console.log(stopwordsDE);

  var tokenizedWordsNoStop = tokenizedWords.filter(
    (item) => !stopwordsDE.includes(item.value.toLowerCase())
  );
 
  //   var tokenizedWordsNoStop = tokenizedWords.filter(function (item) {
  //     return stopwordsDE.indexOf(item) === -1;
  //   });

  console.log(tokenizedWordsNoStop);

  readline.close();
});
