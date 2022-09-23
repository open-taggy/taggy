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
const fs_1 = __importDefault(require("fs"));
//import synonyms from "germansynonyms";
// import openthesaurus from "openthesaurus";
const openthesaurus = require("openthesaurus");
let finalInput = [];
let glossarEnriched = [];
// OPTIONAL
// include wink-nlp (lemmatizing)
// OPTIONAL
exports.taggy = {
    taggy: () => {
        // create shell input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const stopwordsDE = stopwords_iso_1.default.de;
        rl.question("Input: ", (input) => {
            console.log(`Tokens for "${input}":`);
            // optional lemmatizer for tech words?
            //let lemmatized = null;
            //lemmatized = jargon.Lemmatize(input, stackexchange);
            //console.log(lemmatized.toString());
            // optional lemmatizer for tech words?
            // tokenize input
            const winkTokenizer = new wink_tokenizer_1.default();
            let tokenizedItems = winkTokenizer.tokenize(input);
            let tokenizedWords = tokenizedItems.filter((item) => {
                return item.tag === "word";
            });
            console.log(tokenizedItems);
            console.log(tokenizedWords);
            console.log(stopwordsDE);
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
            console.log(tokenizedValues);
            // console.log(tokenizedValues);
            let enrichedInputValues = [];
            // get baseforms from openthesaurus?
            for (const word of tokenizedValues) {
                console.log("trying for", word);
                openthesaurus.get(word).then((response) => {
                    if (response && response.baseforms) {
                        console.log(response.baseforms);
                        enrichedInputValues.push(response.baseforms);
                    }
                });
            }
            // get baseforms from openthesaurus?
            // read glossar data
            let rawData = fs_1.default.readFileSync("../taggy/data/glossar.json");
            let glossar = JSON.parse(rawData.toString());
            console.log(glossar);
            let glossarTags = glossar.tags;
            // look for matches in glossar
            for (const tag of glossarTags) {
                for (const word of tag.words) {
                    console.log(word);
                    glossarEnriched.push(word);
                    // get baseforms from openthesaurus?
                    openthesaurus.get(word).then((response) => {
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
                if (finalInput.includes(normalize_for_search_1.default(element))) {
                    console.log("-> MATCH");
                }
            }
            rl.close();
        });
    },
};
