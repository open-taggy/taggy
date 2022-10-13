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
import { countBy, sample, orderBy, groupBy } from "lodash";
import { stringify } from "querystring";

// let glossarData = require("../taggy/data/glossar.json");
let glossarData = require("../data/glossar.json");
// import * as glossarData from "../taggy/data/glossar.json";

//import synonyms from "germansynonyms";
// import openthesaurus from "openthesaurus";
const openthesaurus = require("openthesaurus");

// OPTIONS
let OPENTHESAURUS_ENABLED: boolean = false;

let finalInput: string[] = [];
let glossarEnriched: string[] = [];
let tagify: Tagify;
let mostFrequent: string[] = [];

// OPTIONAL
// include wink-nlp (lemmatizing)
// OPTIONAL

export class Taggy {
  public name: string;
  public tagify!: Tagify;
  public useTaggy: boolean = true;
  public inputField: HTMLElement;
  public outputField: HTMLElement;
  public frequencyOutput: HTMLSpanElement;
  public mostFrequent: string[] = [];

  constructor(
    inputField: HTMLInputElement,
    outputField: HTMLInputElement,
    frequencyOutput: HTMLSpanElement,
    useTaggy = true
    // settings = {}
  ) {
    this.name = "taggy";
    this.useTaggy = useTaggy;
    this.inputField = inputField;
    this.outputField = outputField;
    if (this.outputField) this.outputField.setAttribute("readOnly", "true");
    this.frequencyOutput = frequencyOutput;
    console.log("created the taggy object");
    return;
  }

  hello(): string {
    return "this is taggy";
  }

  setInputField(inputField: HTMLInputElement) {
    this.inputField = inputField;
    console.log("taggy", "input field set");
  }

  setOutputField(outputField: HTMLInputElement) {
    // outputField.setAttribute("value", "");
    outputField.readOnly = true;
    outputField.value = "";
    this.outputField = outputField;
    console.log("taggy", "output field set");
  }

  setFrequencyOutput(frequencyOutput: HTMLSpanElement) {
    this.frequencyOutput = frequencyOutput;
  }

  setMostFrequent(input: string[]) {
    this.mostFrequent = input;
  }

  getMostFrequent() {
    console.log("most frequent called", taggy.getMostFrequent());
    return taggy.getMostFrequent();
    // return this.mostFrequent;
  }

  createTagify(inputElement: HTMLInputElement) {
    this.tagify = new Tagify(inputElement);
    return this.tagify;
  }

  async processInput(input: string) {
    this.outputField.setAttribute("value", "");
    let processedInput = await processInput(input);
    this.outputField.setAttribute("value", processedInput[0]);
    return processedInput;
  }

  async processAndAddTags(input: string, outputField: HTMLOutputElement) {
    this.outputField.setAttribute("value", "");
    let processedInput = await processInput(input);
    let mostFrequent = taggy.getMostFrequent();
    this.outputField.setAttribute("value", processedInput[0]);
    outputField.value = processedInput[0];
    return mostFrequent;
  }

  addTags(input: string) {
    if (this.useTaggy) {
      tagify.addTags(input);
    } else {
      this.outputField.setAttribute("value", input);
    }
    return tagify;
  }

  deleteTags() {
    console.log("called deleteTags");
    tagify.removeTags();
  }
}

export const taggy = {
  createTagify: (inputElement: HTMLInputElement) => {
    // console.log(inputElement);
    tagify = new Tagify(inputElement);
    return tagify;
  },
  processInput: (input: string) => {
    return processInput(input);
  },
  addTags: (input: string) => {
    tagify.addTags(input);
    return tagify;
  },
  deleteTags: () => {
    console.log("called deleteTags");
    tagify.removeTags();
  },
  getMostFrequent: () => {
    return mostFrequent;
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
  console.log("called processinput");
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

  console.log("Tokenized Values");
  console.log(tokenizedValues);

  if (tokenizedValues.length < 2) return [];

  console.log("COUNTED");
  console.log(countBy(tokenizedValues));

  let enrichedInputValues: string[] = [];
  mostFrequent = [];

  // don't call openthesaurus-API too often (-> results in too many requests error)
  if (tokenizedValues.length < 20) {
    // get baseforms from openthesaurus?
    for await (const word of tokenizedValues) {
      // enrichedInputValues.push(word);

      if (OPENTHESAURUS_ENABLED) {
        console.log("CALLING OPENTHESAURUS API");
        await openthesaurus.get(word).then((response: any) => {
          if (response && response.baseforms) {
            console.log(response.baseforms);
            enrichedInputValues.push(response.baseforms);
          }
        });
      }
    }
  }

  // flat out arrays
  enrichedInputValues = enrichedInputValues
    .flat()
    .concat(tokenizedValues.flat());

  // get baseforms from openthesaurus?

  // read glossar data
  // let rawData = fs.readFileSync("../taggy/data/glossar.json");
  // console.log(process.cwd());
  // console.log(glossarData);
  // let glossar = JSON.parse(glossarData.toString());
  // console.log(glossar);

  let glossarTags: string[] = [];
  let combinedWordsReturnSet: string[] = [];

  let inputLowerCase = input.toLowerCase();

  for (const tag of glossarData.tags) {
    for (const word of tag.words) {
      glossarTags.push(word);

      // check input for "whitespace-words"
      if (word.includes(" ")) {
        if (inputLowerCase.includes(word)) {
          combinedWordsReturnSet.push(word);
          console.log("whitespace-word match added", word);
        }
      }
    }
  }

  console.log("GLOSSARTAGS");
  console.log(glossarTags);

  // ASYNC AWAIT OR PROMOISE NEEDED
  // let glossarEnriched = enrichWithOpenThesaurus(glossarTags);
  let glossarEnriched = glossarTags;

  console.log("GLOSSARENRICHED");
  console.log(glossarEnriched);

  console.log("ENRICHEDINPUTVALUES");
  console.log(enrichedInputValues);

  let returnValues: string[] = [];

  // look for matches in glossar
  for (const glossarValue of glossarEnriched) {
    // console.log("- " + word);

    for (const inputValue of enrichedInputValues) {
      if (inputValue == glossarValue) returnValues.push(inputValue);
    }
    // if (enrichedInputValues.includes(normalizer(word))) {
    //   console.log("-> MATCH");
    //   returnValues.push(word);
    // }
  }

  console.log("returnValues before", returnValues);

  // most frequent single words in text
  // console.log("ENRICHEDINPUTVALUES MODE ARRAY");
  // console.log(modeArray(enrichedInputValues));

  // if (modeArray(enrichedInputValues)?.length == 1) {
  //   return modeArray(enrichedInputValues)!;
  // }

  console.log("COMBINEDWORDSRETURNSET", combinedWordsReturnSet);
  console.log("RETURN VALUES", returnValues);

  // let returnArray: string[] = combinedWordsReturnSet.concat([
  //   sample(returnValues)!,
  // ]);

  let finalSet: string[] = [...combinedWordsReturnSet!].concat(returnValues);

  console.log("FINAL SET", finalSet);
  console.log(finalSet);

  // matches with most occurencies
  mostFrequent = modeArray(finalSet)!;
  console.log("MOSTFREQUENT MODE ARRAY");
  console.log(mostFrequent);

  return [sample(mostFrequent)!];
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

// function getMostFrequent(arr: any) {
//   const hashmap = arr.reduce((acc: any, val: any) => {
//     acc[val] = (acc[val] || 0) + 1;
//     return acc;
//   }, {});
//   return Object.keys(hashmap).reduce((a, b) =>
//     hashmap[a] > hashmap[b] ? a : b
//   );
// }

function modeArray(array: any) {
  if (array.length == 0) return null;
  var modeMap: any = {},
    maxCount = 1,
    modes = [];

  for (var i = 0; i < array.length; i++) {
    var el = array[i];

    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;

    if (modeMap[el] > maxCount) {
      modes = [el];
      maxCount = modeMap[el];
    } else if (modeMap[el] == maxCount) {
      modes.push(el);
      maxCount = modeMap[el];
    }
  }
  return modes;
}
