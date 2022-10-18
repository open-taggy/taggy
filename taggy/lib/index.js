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
// import jargon from "@clipperhouse/jargon";
// import stackexchange from "@clipperhouse/jargon/stackexchange"; // a dictionary
// import fs from "fs";
require("regenerator-runtime/runtime");
const tagify_1 = __importDefault(require("@yaireo/tagify"));
const lodash_1 = require("lodash");
// import { stringify } from "querystring";
// import { match } from "assert";
// let glossarData = require("../taggy/data/glossar.json");
let glossarData = require("../data/glossar.json");
let config = require("../data/config.json");
// import * as glossarData from "../taggy/data/glossar.json";
// OPTIONAL
// include wink-nlp (lemmatizing)
// OPTIONAL
//import synonyms from "germansynonyms";
const openthesaurus = require("openthesaurus");
// OPTIONS
let OPENTHESAURUS_ENABLED = false;
let ASSIGN_TOP = true;
OPENTHESAURUS_ENABLED = config.openthesaurus === "true";
console.log("GLOBAL OP", OPENTHESAURUS_ENABLED);
ASSIGN_TOP = config.categories["assign-top"] === "true";
console.log("GLOBAL AT", ASSIGN_TOP);
let tagify;
let mostFrequent = [];
class Taggy {
    constructor(inputField, outputField, frequencyOutput, useTaggy = true, 
    // settings = {}
    OPENTHESAURUS_ENABLED = config.openthesaurus === true, ASSIGN_TOP = config.categories["assign-top"] === true) {
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
        console.log("OP", OPENTHESAURUS_ENABLED);
        console.log("AT", ASSIGN_TOP);
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
        console.log("processedinput", processedInput[0]);
        processedInput[0] = processedInput[0] ? processedInput[0] : "";
        this.outputField.setAttribute("value", processedInput[0]);
        return processedInput;
    }
    async processAndAddTags(input, outputField) {
        this.outputField.setAttribute("value", "");
        let processedInput = await this.processInput(input);
        // let mostFrequent = taggy.getMostFrequent();
        this.outputField.setAttribute("value", processedInput[0]);
        outputField.value = processedInput[0];
        // TODO -> modularize
        if (this.useTaggy) {
            tagify = this.createTagify(outputField);
            tagify.removeAllTags();
            tagify.addTags(processedInput[0]);
        }
        return processedInput[0];
    }
    addTags(input) {
        if (this.useTaggy) {
            this.tagify.addTags(input);
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
    // filter out german stopwords
    let tokenizedWordsNoStop = tokenizedWords.filter((item) => !stopwordsDE.includes(item.value));
    // normalize input (remove umlaute and transform to lowercase)
    let tokenizedValues = [];
    for (const element of tokenizedWordsNoStop) {
        tokenizedValues.push(normalize_for_search_1.default(element.value));
        // optional lemmatizer for tech words?
        // lemmatized = jargon.Lemmatize(element.value, stackexchange);
        // console.log(lemmatized.toString());
        // optional lemmatizer for tech words?
    }
    console.log("tokenized and normalized values");
    console.log(tokenizedValues);
    // return if input is too small
    if (tokenizedValues.length < 2)
        return [];
    let enrichedInputValues = [];
    mostFrequent = [];
    // don't call openthesaurus-API too often (-> results in too many requests error)
    if (OPENTHESAURUS_ENABLED && tokenizedValues.length < 20) {
        // get baseforms from openthesaurus?
        for await (const word of tokenizedValues) {
            // enrichedInputValues.push(word);
            console.log("CALLING OPENTHESAURUS API");
            await openthesaurus.get(word).then((response) => {
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
    let glossarTags = [];
    let combinedWordsReturnSet = [];
    let inputLowerCase = normalize_for_search_1.default(input);
    for (const tag of glossarData.tags) {
        for (const word of tag.words) {
            // normalize input
            glossarTags.push(normalize_for_search_1.default(word));
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
    let finalValue = lodash_1.sample(mostFrequent);
    console.log("FINALVALUE", finalValue);
    console.log(glossarData.tags);
    let searchGlossar = glossarData.tags;
    let finalReturnValue = "";
    // if ASSIGN_TOP is set -> return top categegory
    if (ASSIGN_TOP) {
        searchGlossar.forEach((category) => {
            console.log(category);
            category.words.forEach((word) => {
                if (normalize_for_search_1.default(word) == finalValue) {
                    console.log("MATCH FOR", category.name);
                    finalReturnValue = category.name;
                }
            });
        });
        return [finalReturnValue];
    }
    else {
        return [finalValue];
    }
    // console.log(returnValue);
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
