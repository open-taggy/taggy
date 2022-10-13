"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taggy = exports.Taggy = void 0;
const readline = __importStar(require("readline"));
const wink_tokenizer_1 = __importDefault(require("wink-tokenizer"));
const stopwords_iso_1 = __importDefault(require("stopwords-iso")); // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
const normalize_for_search_1 = __importDefault(require("normalize-for-search"));
require("regenerator-runtime/runtime");
const tagify_1 = __importDefault(require("@yaireo/tagify"));
const lodash_1 = require("lodash");
// let glossarData = require("../taggy/data/glossar.json");
let glossarData = require("../data/glossar.json");
// import * as glossarData from "../taggy/data/glossar.json";
//import synonyms from "germansynonyms";
// import openthesaurus from "openthesaurus";
const openthesaurus = require("openthesaurus");
// OPTIONS
let OPENTHESAURUS_ENABLED = false;
let finalInput = [];
let glossarEnriched = [];
let tagify;
let mostFrequent = [];
// OPTIONAL
// include wink-nlp (lemmatizing)
// OPTIONAL
class Taggy {
    constructor(inputField, outputField, frequencyOutput, useTaggy = true
    // settings = {}
    ) {
        this.useTaggy = true;
        this.mostFrequent = [];
        this.name = "taggy";
        this.useTaggy = useTaggy;
        this.inputField = inputField;
        this.outputField = outputField;
        if (this.outputField)
            this.outputField.setAttribute("readOnly", "true");
        this.frequencyOutput = frequencyOutput;
        console.log("created the taggy object");
        return;
    }
    hello() {
        return "this is taggy";
    }
    setInputField(inputField) {
        this.inputField = inputField;
        console.log("taggy", "input field set");
    }
    setOutputField(outputField) {
        // outputField.setAttribute("value", "");
        outputField.readOnly = true;
        outputField.value = "";
        this.outputField = outputField;
        console.log("taggy", "output field set");
    }
    setFrequencyOutput(frequencyOutput) {
        this.frequencyOutput = frequencyOutput;
    }
    setMostFrequent(input) {
        this.mostFrequent = input;
    }
    getMostFrequent() {
        console.log("most frequent called", exports.taggy.getMostFrequent());
        return exports.taggy.getMostFrequent();
        // return this.mostFrequent;
    }
    createTagify(inputElement) {
        this.tagify = new tagify_1.default(inputElement);
        return this.tagify;
    }
    async processInput(input) {
        this.outputField.setAttribute("value", "");
        let processedInput = await processInput(input);
        this.outputField.setAttribute("value", processedInput[0]);
        return processedInput;
    }
    async processAndAddTags(input, outputField) {
        this.outputField.setAttribute("value", "");
        let processedInput = await processInput(input);
        let mostFrequent = exports.taggy.getMostFrequent();
        this.outputField.setAttribute("value", processedInput[0]);
        outputField.value = processedInput[0];
        return mostFrequent;
    }
    addTags(input) {
        if (this.useTaggy) {
            tagify.addTags(input);
        }
        else {
            this.outputField.setAttribute("value", input);
        }
        return tagify;
    }
    deleteTags() {
        console.log("called deleteTags");
        tagify.removeTags();
    }
}
exports.Taggy = Taggy;
exports.taggy = {
    createTagify: (inputElement) => {
        // console.log(inputElement);
        tagify = new tagify_1.default(inputElement);
        return tagify;
    },
    processInput: (input) => {
        return processInput(input);
    },
    addTags: (input) => {
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
        rl.question("Input: ", (input) => {
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
async function processInput(input) {
    console.log("called processinput");
    // tokenize input
    const winkTokenizer = new wink_tokenizer_1.default();
    const stopwordsDE = stopwords_iso_1.default.de;
    let tokenizedItems = winkTokenizer.tokenize(input);
    let tokenizedWords = tokenizedItems.filter((item) => {
        return item.tag === "word";
    });
    // console.log(tokenizedItems);
    // console.log(tokenizedWords);
    // console.log(stopwordsDE);
    // filter out german stopwords
    let tokenizedWordsNoStop = tokenizedWords.filter((item) => !stopwordsDE.includes(item.value));
    // create array with only lowercase and normalized (remove ö and stuff)
    let tokenizedValues = [];
    for (const element of tokenizedWordsNoStop) {
        tokenizedValues.push(normalize_for_search_1.default(element.value));
        // optional lemmatizer for tech words?
        // lemmatized = jargon.Lemmatize(element.value, stackexchange);
        // console.log(lemmatized.toString());
        // optional lemmatizer for tech words?
    }
    console.log("Tokenized Values");
    console.log(tokenizedValues);
    if (tokenizedValues.length < 2)
        return [];
    console.log("COUNTED");
    console.log(lodash_1.countBy(tokenizedValues));
    let enrichedInputValues = [];
    mostFrequent = [];
    // don't call openthesaurus-API too often (-> results in too many requests error)
    if (tokenizedValues.length < 20) {
        // get baseforms from openthesaurus?
        for await (const word of tokenizedValues) {
            // enrichedInputValues.push(word);
            if (OPENTHESAURUS_ENABLED) {
                console.log("CALLING OPENTHESAURUS API");
                await openthesaurus.get(word).then((response) => {
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
    let glossarTags = [];
    let combinedWordsReturnSet = [];
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
    let returnValues = [];
    // look for matches in glossar
    for (const glossarValue of glossarEnriched) {
        // console.log("- " + word);
        for (const inputValue of enrichedInputValues) {
            if (inputValue == glossarValue)
                returnValues.push(inputValue);
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
    let finalSet = [...combinedWordsReturnSet].concat(returnValues);
    console.log("FINAL SET", finalSet);
    console.log(finalSet);
    // matches with most occurencies
    mostFrequent = modeArray(finalSet);
    console.log("MOSTFREQUENT MODE ARRAY");
    console.log(mostFrequent);
    return [lodash_1.sample(mostFrequent)];
}
function enrichWithOpenThesaurus(inputArray) {
    let enrichedArray = [];
    for (const word of inputArray) {
        // get baseforms from openthesaurus?
        openthesaurus.get(word).then((response) => {
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
function modeArray(array) {
    if (array.length == 0)
        return null;
    var modeMap = {}, maxCount = 1, modes = [];
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if (modeMap[el] > maxCount) {
            modes = [el];
            maxCount = modeMap[el];
        }
        else if (modeMap[el] == maxCount) {
            modes.push(el);
            maxCount = modeMap[el];
        }
    }
    return modes;
}
