import * as readline from "readline";
import tokenizer from "wink-tokenizer";
import stopwords from "stopwords-iso"; // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
import normalizer from "normalize-for-search";
import { sample } from "lodash";
import "regenerator-runtime/runtime";
//import synonyms from "germansynonyms";
import Tagify from "@yaireo/tagify";

// import jargon from "@clipperhouse/jargon";
// import stackexchange from "@clipperhouse/jargon/stackexchange"; // a dictionary
// import fs from "fs";
// include wink-nlp (lemmatizing)
import openthesaurus from "openthesaurus";
const glossarData = require("../data/glossar.json");
const config = require("../data/config.json");

export class Taggy {
  private tagify!: Tagify;
  private winkTokenizer: tokenizer;
  private stopwordsDE: any;

  private inputField: HTMLElement;
  private outputField: HTMLElement;
  private frequencyOutput: HTMLSpanElement;
  private mostFrequent: string[] = [];
  private USE_TAGIFY: boolean = config["use-tagify"] === "true";
  private OPENTHESAURUS_ENABLED: boolean = config["openthesaurus"] === "true";
  private ASSIGN_TOP: boolean = config.categories["assign-top"] === "true";
  private INCLUDE_TOP: boolean = config.categories["include-top"] === "true";

  /**
   * Create a new instance of taggy
   * @param inputField Input field where user text goes
   * @param outputField Output field where the tags will show up
   * @param frequencyOutput Show frequency of identified tags
   * @param useTagify Optional: Use tagify dependency? Default: true
   */
  constructor(
    inputField: HTMLInputElement,
    outputField: HTMLInputElement,
    frequencyOutput: HTMLSpanElement,
    useTagify: boolean = config.categories["assign-top"] === "true"
  ) {
    this.inputField = inputField;
    this.outputField = outputField;
    this.USE_TAGIFY = useTagify;
    this.winkTokenizer = new tokenizer();
    this.stopwordsDE = stopwords.de;
    if (this.outputField) this.outputField.setAttribute("readOnly", "true");
    this.frequencyOutput = frequencyOutput;
    console.log("created the taggy object");
    console.log("OP", this.OPENTHESAURUS_ENABLED);
    console.log("USE_TAGIFY", this.USE_TAGIFY);
    console.log("ASSIGN-TOP", this.ASSIGN_TOP);
    console.log("INCLUDE-TOP", this.INCLUDE_TOP);
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
    console.log("most frequent called", this.mostFrequent);
    return this.mostFrequent;
  }

  createTagify(inputElement: HTMLInputElement) {
    this.tagify = new Tagify(inputElement);
    return this.tagify;
  }

  async process(input: string) {
    this.outputField.setAttribute("value", "");
    let processedInput = await this.processInput(input);
    console.log("processedinput", processedInput[0]);
    processedInput[0] = processedInput[0] ? processedInput[0] : "";
    this.outputField.setAttribute("value", processedInput[0]);
    return processedInput;
  }

  async processAndAddTags(input: string, outputField: HTMLInputElement) {
    this.outputField.setAttribute("value", "");
    let processedInput = await this.processInput(input);
    // let mostFrequent = taggy.getMostFrequent();
    this.outputField.setAttribute("value", processedInput[0]);
    outputField.value = processedInput[0];

    // TODO -> modularize
    if (this.USE_TAGIFY) {
      this.tagify = this.createTagify(outputField);
      this.tagify.removeAllTags();
      this.tagify.addTags(processedInput[0]);
    }
    return processedInput[0];
  }

  addTags(input: string) {
    if (this.USE_TAGIFY) {
      this.tagify.addTags(input);
    } else {
      this.outputField.setAttribute("value", input);
    }
    return this.tagify;
  }

  deleteTags() {
    console.log("called deleteTags");
    this.tagify.removeTags();
  }

  async processInput(input: string): Promise<string[]> {
    console.log("called processinput");

    let tokenizedItems = this.winkTokenizer.tokenize(input);
    let tokenizedWords = tokenizedItems.filter((item) => {
      return item.tag === "word";
    });

    // filter out german stopwords
    let tokenizedWordsNoStop = tokenizedWords.filter(
      (item) => !this.stopwordsDE.includes(item.value)
    );

    // normalize input (remove umlaute and transform to lowercase)
    let tokenizedValues = [];
    for (const element of tokenizedWordsNoStop) {
      tokenizedValues.push(normalizer(element.value));

      // optional lemmatizer for tech words?
      // lemmatized = jargon.Lemmatize(element.value, stackexchange);
      // console.log(lemmatized.toString());
      // optional lemmatizer for tech words?
    }

    console.log("tokenized and normalized values");
    console.log(tokenizedValues);

    // return if input is too small
    if (tokenizedValues.length < 2) return [];

    let enrichedInputValues: string[] = [];
    this.mostFrequent = [];

    // don't call openthesaurus-API too often (-> results in too many requests error)
    if (this.OPENTHESAURUS_ENABLED && tokenizedValues.length < 20) {
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

    // flat out arrays
    enrichedInputValues = enrichedInputValues
      .flat()
      .concat(tokenizedValues.flat());

    console.log("NORMALIZED/ENRICHED INPUTVALUES");
    console.log(enrichedInputValues);

    let glossarTags: string[] = [];
    let combinedWordsReturnSet: string[] = [];

    let inputLowerCase = normalizer(input);

    for (const tag of glossarData.tags) {
      for (const word of tag.words) {
        // normalize input
        glossarTags.push(normalizer(word));

        // check input for "whitespace-words"
        if (word.includes(" ")) {
          if (inputLowerCase.includes(word)) {
            let matchArray = inputLowerCase.matchAll(word);
            for (let match of matchArray) {
              combinedWordsReturnSet.push(match[0]);
              console.log(match[0]);
              console.log("whitespace-word match added", match[0]);
            }
          }
        }
      }
    }

    console.log("WORDS IN GLOSSAR");
    console.log(glossarTags);

    // ASYNC AWAIT OR PROMOISE NEEDED
    // let glossarEnriched = enrichWithOpenThesaurus(glossarTags);
    let glossarEnriched = glossarTags;

    // console.log("GLOSSARENRICHED");
    // console.log(glossarEnriched);

    console.log("ENRICHED INPUTVALUES");
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

    console.log("COMBINEDWORDSRETURNSET", combinedWordsReturnSet);
    console.log("RETURN VALUES", returnValues);

    // let returnArray: string[] = combinedWordsReturnSet.concat([
    //   sample(returnValues)!,
    // ]);

    let finalSet: string[] = [...combinedWordsReturnSet!].concat(returnValues);

    console.log("FINAL SET", finalSet);
    console.log(finalSet);

    // matches with most occurencies
    this.mostFrequent = modeArray(finalSet)!;
    console.log("MOSTFREQUENT MODE ARRAY");
    console.log(this.mostFrequent);

    let finalValue = sample(this.mostFrequent)!;
    console.log("FINALVALUE", finalValue);

    console.log(glossarData.tags);
    let searchGlossar = glossarData.tags;

    let finalReturnValue = "";

    // if ASSIGN_TOP is set -> return top categegory
    if (this.ASSIGN_TOP) {
      searchGlossar.forEach((category: any) => {
        console.log(category);
        category.words.forEach((word: string) => {
          if (normalizer(word) == finalValue) {
            console.log("MATCH FOR", category.name);
            finalReturnValue = category.name;
          }
        });
      });
      return [finalReturnValue];
    } else {
      return [finalValue];
    }

    // console.log(returnValue);
  }
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
