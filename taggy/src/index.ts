import * as readline from "readline";
import tokenizer from "wink-tokenizer";
import stopwords from "stopwords-iso"; // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
import normalizer from "normalize-for-search";
import jargon from "@clipperhouse/jargon";
import stackexchange from "@clipperhouse/jargon/stackexchange"; // a dictionary
import fs from "fs";
//import synonyms from "germansynonyms";
// import openthesaurus from "openthesaurus";
const openthesaurus = require("openthesaurus");

let finalInput: string[] = [];
let glossarEnriched: string[] = [];

// OPTIONAL
// include wink-nlp (lemmatizing)
// OPTIONAL


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

      // optional lemmatizer for tech words?
      //let lemmatized = null;
      //lemmatized = jargon.Lemmatize(input, stackexchange);
      //console.log(lemmatized.toString());
      // optional lemmatizer for tech words?

      // tokenize input
      const winkTokenizer = new tokenizer();
      let tokenizedItems = winkTokenizer.tokenize(input);
      let tokenizedWords = tokenizedItems.filter((item) => {
        return item.tag === "word";
      });
      console.log(tokenizedItems);
      console.log(tokenizedWords);
      console.log(stopwordsDE);

      // filter out german stopwords
      let tokenizedWordsNoStop = tokenizedWords.filter(
        (item) => !stopwordsDE.includes(item.value)
      );

      // create array with only lowercase and normalized (remove ö and stuff)
      let tokenizedValues = [];
      for (const element of tokenizedWordsNoStop) {
        tokenizedValues.push(normalizer(element.value));

        // optional lemmatizer for tech words?
        // lemmatized = jargon.Lemmatize(element.value, stackexchange);
        // console.log(lemmatized.toString());
        // optional lemmatizer for tech words?
      }

      console.log(tokenizedValues);
      // console.log(tokenizedValues);

      let enrichedInputValues = [];

      // get baseforms from openthesaurus?
      for (const word of tokenizedValues) {
        console.log("trying for", word);
        openthesaurus.get(word).then((response: any) => {
          if (response && response.baseforms) {
            console.log(response.baseforms);
            enrichedInputValues.push(response.baseforms);
          }
        });
      }
      // get baseforms from openthesaurus?

      // read glossar data
      let rawData = fs.readFileSync("../taggy/data/glossar.json");
      let glossar = JSON.parse(rawData.toString());
      console.log(glossar);

      let glossarTags = glossar.tags;

      // look for matches in glossar
      for (const tag of glossarTags) {
        for (const word of tag.words) {
          console.log(word);
          glossarEnriched.push(word);
          // get baseforms from openthesaurus?
          openthesaurus.get(word).then((response: any) => {
            if (response && response.baseforms) {
              console.log(response.baseforms);
              glossarEnriched.push(response.baseforms);
            }
            // get baseforms from openthesaurus?
          });
        }
      }

      for (const element of glossarEnriched) {
        console.log("- " + element);
        if (finalInput.includes(normalizer(element))) {
          console.log("-> MATCH");
        }
      }

      rl.close();
    });
  },
};
