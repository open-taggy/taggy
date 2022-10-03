import * as readline from "readline";
import tokenizer from "wink-tokenizer";
import stopwords from "stopwords-iso"; // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
import normalizer from "normalize-for-search";
import jargon from "@clipperhouse/jargon";
import stackexchange from "@clipperhouse/jargon/stackexchange"; // a dictionary
import fs from "fs";
import "regenerator-runtime/runtime";
import Tagify from "@yaireo/tagify";

// let glossarData = require("../taggy/data/glossar.json");
let glossarData = require("../data/glossar.json");
// import * as glossarData from "../taggy/data/glossar.json";

//import synonyms from "germansynonyms";
// import openthesaurus from "openthesaurus";
const openthesaurus = require("openthesaurus");

let finalInput: string[] = [];
let glossarEnriched: string[] = [];
let tagify: Tagify;

// OPTIONAL
// include wink-nlp (lemmatizing)
// OPTIONAL

export const taggy = {
  taggyVanilla: (input: string) => {
    return processInput(input);
  },
  createTagify: (inputElement: HTMLInputElement) => {
    console.log(inputElement);
    tagify = new Tagify(inputElement);
    return tagify;
  },
  addTags: (input: string) => {
    tagify.addTags(input);
    return tagify;
  },
  taggyCLI: () => {
    // create shell input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Input: ", (input: string) => {
      console.log(`Tokens for "${input}":`);

      // optional lemmatizer for tech words?
      //let lemmatized = null;
      //lemmatized = jargon.Lemmatize(input, stackexchange);
      //console.log(lemmatized.toString());
      // optional lemmatizer for tech words?

      processInput(input);

      rl.close();
    });
  },
};

async function processInput(input: string): Promise<string[]> {
  // tokenize input
  const winkTokenizer = new tokenizer();
  const stopwordsDE = stopwords.de;

  let tokenizedItems = winkTokenizer.tokenize(input);
  let tokenizedWords = tokenizedItems.filter((item) => {
    return item.tag === "word";
  });
  // console.log(tokenizedItems);
  // console.log(tokenizedWords);
  // console.log(stopwordsDE);

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

  // console.log(tokenizedValues);
  // console.log(tokenizedValues);

  let enrichedInputValues: string[] = [];

  // don't call openthesaurus-API too often (-> results in too many requests error)
  if (tokenizedValues.length < 20) {
    // get baseforms from openthesaurus?
    for await (const word of tokenizedValues) {
      // enrichedInputValues.push(word);
      console.log("CALLING OPENTHESAURUS API");

      await openthesaurus.get(word).then((response: any) => {
        if (response && response.baseforms) {
          console.log(response.baseforms);
          enrichedInputValues.push(response.baseforms);
        }
      });
    }
  }

  enrichedInputValues = enrichedInputValues.concat(tokenizedValues);

  // get baseforms from openthesaurus?

  // read glossar data
  // let rawData = fs.readFileSync("../taggy/data/glossar.json");
  // console.log(process.cwd());
  // console.log(glossarData);
  // let glossar = JSON.parse(glossarData.toString());
  // console.log(glossar);

  let glossarTags: string[] = [];

  for (const tag of glossarData.tags) {
    for (const word of tag.words) {
      glossarTags.push(word);
    }
  }

  // ASYNC AWAIT OR PROMOISE NEEDED
  // let glossarEnriched = enrichWithOpenThesaurus(glossarTags);
  let glossarEnriched = glossarTags;

  console.log("GLOSSARENRICHED");
  console.log(glossarEnriched);

  console.log("ENRICHEDINPUTVALUE");
  console.log(enrichedInputValues);

  let returnValues: string[] = [];

  // look for matches in glossar
  for (const word of glossarEnriched) {
    // console.log("- " + word);
    if (enrichedInputValues.includes(normalizer(word))) {
      console.log("-> MATCH");
      returnValues.push(word);
    }
  }

  return returnValues;
}

function enrichWithOpenThesaurus(inputArray: string[]) {
  let enrichedArray: string[] = [];

  for (const word of inputArray) {
    // get baseforms from openthesaurus?
    openthesaurus.get(word).then((response: any) => {
      if (response && response.baseforms) {
        console.log(response.baseforms);
        enrichedArray.push(response.baseforms);
      }
      // get baseforms from openthesaurus?
    });
  }

  return enrichedArray;
}
