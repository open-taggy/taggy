import * as readline from "readline";
import tokenizer from "wink-tokenizer";
import stopwords from "stopwords-iso"; // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
import normalizer from "normalize-for-search";
import fs from "fs";
const winkTokenizer = new tokenizer();

export const taggy = {
  taggy: () => {
    // create shell input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stopwordsDE = stopwords.de;

    rl.question("Input: ", (input: string) => {
      console.log(`Tokens for "${input}":`);

      // tokenize input
      let tokenizedItems = winkTokenizer.tokenize(input);
      let tokenizedWords = tokenizedItems.filter((item) => {
        return item.tag === "word";
      });
      console.log(tokenizedItems);
      console.log(tokenizedWords);
      console.log(stopwordsDE);

      // filter out german stopwords
      let tokenizedWordsNoStop = tokenizedWords.filter(
        (item) => !stopwordsDE.includes(item.value.toLowerCase())
      );

      // create array with only lowercase
      let tokenizedValues = [];
      for (const element of tokenizedWordsNoStop) {
        tokenizedValues.push(element.value.toLowerCase());
      }

      console.log(tokenizedWordsNoStop);
      // console.log(tokenizedValues);

      console.log(process.cwd());

      // read glossar data
      let rawData = fs.readFileSync("../taggy/data/glossar.json");
      let glossar = JSON.parse(rawData.toString());
      console.log(glossar);

      let glossarTags = glossar.tags;

      // look for matches in glossar
      for (const tag of glossarTags) {
        console.log(tag.name + ": ");
        for (const word of tag.words) {
          console.log("- " + word);

          if (tokenizedValues.includes(word.toLowerCase())) {
            console.log("-> MATCH");
          }
        }
      }

      rl.close();
    });
  },
};
