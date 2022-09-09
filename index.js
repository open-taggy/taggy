// module.exports = function taggy() {
//   return "this is where it starts. ";
// };
var tokenizer = require("wink-tokenizer");
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

  readline.close();
});
