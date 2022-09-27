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
exports.taggy = void 0;
const readline = __importStar(require("readline"));
const wink_tokenizer_1 = __importDefault(require("wink-tokenizer"));
const stopwords_iso_1 = __importDefault(require("stopwords-iso")); // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
const normalize_for_search_1 = __importDefault(require("normalize-for-search"));
// let glossarData = require("../taggy/data/glossar.json");
let glossarData = require("../data/glossar.json");
// import * as glossarData from "../taggy/data/glossar.json";
//import synonyms from "germansynonyms";
// import openthesaurus from "openthesaurus";
const openthesaurus = require("openthesaurus");
let finalInput = [];
let glossarEnriched = [];
// OPTIONAL
// include wink-nlp (lemmatizing)
// OPTIONAL
exports.taggy = {
    taggyVanilla: (input) => {
        return processInput(input);
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
function processInput(input) {
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
    // console.log(tokenizedValues);
    // console.log(tokenizedValues);
    let enrichedInputValues = [];
    // get baseforms from openthesaurus?
    for (const word of tokenizedValues) {
        enrichedInputValues.push(word);
        // openthesaurus.get(word).then((response: any) => {
        //   if (response && response.baseforms) {
        //     // console.log(response.baseforms);
        //     enrichedInputValues.push(response.baseforms);
        //   }
        // });
    }
    // get baseforms from openthesaurus?
    // read glossar data
    // let rawData = fs.readFileSync("../taggy/data/glossar.json");
    // console.log(process.cwd());
    // console.log(glossarData);
    // let glossar = JSON.parse(glossarData.toString());
    // console.log(glossar);
    let glossarTags = [];
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
    let returnValues = [];
    // look for matches in glossar
    for (const word of glossarEnriched) {
        // console.log("- " + word);
        if (enrichedInputValues.includes(normalize_for_search_1.default(word))) {
            console.log("-> MATCH");
            returnValues.push(word);
        }
    }
    return returnValues;
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
