"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Taggy = void 0;
const wink_tokenizer_1 = __importDefault(require("wink-tokenizer"));
const stopwords_iso_1 = __importDefault(require("stopwords-iso")); // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
const normalize_for_search_1 = __importDefault(require("normalize-for-search"));
const lodash_1 = require("lodash");
require("regenerator-runtime/runtime");
//import synonyms from "germansynonyms";
const tagify_1 = __importDefault(require("@yaireo/tagify"));
// import jargon from "@clipperhouse/jargon";
// import stackexchange from "@clipperhouse/jargon/stackexchange"; // a dictionary
// import fs from "fs";
// include wink-nlp (lemmatizing)
const openthesaurus_1 = __importDefault(require("openthesaurus"));
const glossarData = require("../data/glossar.json");
const config = require("../data/config.json");
class Taggy {
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param frequencyOutput Show frequency of identified tags
     * @param useTagify Optional: Use tagify dependency? Default: true
     */
    constructor(inputField, outputField, frequencyOutput, useTagify = config.categories["assign-top"] === "true") {
        this.mostFrequent = [];
        this.USE_TAGIFY = config["use-tagify"] === "true";
        this.OPENTHESAURUS_ENABLED = config["openthesaurus"] === "true";
        this.ASSIGN_TOP = config.categories["assign-top"] === "true";
        this.INCLUDE_TOP = config.categories["include-top"] === "true";
        this.inputField = inputField;
        this.outputField = outputField;
        this.USE_TAGIFY = useTagify;
        this.winkTokenizer = new wink_tokenizer_1.default();
        this.stopwordsDE = stopwords_iso_1.default.de;
        if (this.outputField)
            this.outputField.setAttribute("readOnly", "true");
        this.frequencyOutput = frequencyOutput;
        console.log("created the taggy object");
        console.log("OP", this.OPENTHESAURUS_ENABLED);
        console.log("USE_TAGIFY", this.USE_TAGIFY);
        console.log("ASSIGN-TOP", this.ASSIGN_TOP);
        console.log("INCLUDE-TOP", this.INCLUDE_TOP);
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
        console.log("most frequent called", this.mostFrequent);
        return this.mostFrequent;
    }
    createTagify(inputElement) {
        this.tagify = new tagify_1.default(inputElement);
        return this.tagify;
    }
    async process(input) {
        this.outputField.setAttribute("value", "");
        let processedInput = await this.processInput(input);
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
        if (this.USE_TAGIFY) {
            this.tagify = this.createTagify(outputField);
            this.tagify.removeAllTags();
            this.tagify.addTags(processedInput[0]);
        }
        return processedInput[0];
    }
    addTags(input) {
        if (this.USE_TAGIFY) {
            this.tagify.addTags(input);
        }
        else {
            this.outputField.setAttribute("value", input);
        }
        return this.tagify;
    }
    deleteTags() {
        console.log("called deleteTags");
        this.tagify.removeTags();
    }
    async processInput(input) {
        console.log("called processinput");
        let tokenizedItems = this.winkTokenizer.tokenize(input);
        let tokenizedWords = tokenizedItems.filter((item) => {
            return item.tag === "word";
        });
        // filter out german stopwords
        let tokenizedWordsNoStop = tokenizedWords.filter((item) => !this.stopwordsDE.includes(item.value));
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
        this.mostFrequent = [];
        // don't call openthesaurus-API too often (-> results in too many requests error)
        if (this.OPENTHESAURUS_ENABLED && tokenizedValues.length < 20) {
            // get baseforms from openthesaurus?
            for await (const word of tokenizedValues) {
                // enrichedInputValues.push(word);
                console.log("CALLING OPENTHESAURUS API");
                await openthesaurus_1.default.get(word).then((response) => {
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
        this.mostFrequent = modeArray(finalSet);
        console.log("MOSTFREQUENT MODE ARRAY");
        console.log(this.mostFrequent);
        let finalValue = lodash_1.sample(this.mostFrequent);
        console.log("FINALVALUE", finalValue);
        console.log(glossarData.tags);
        let searchGlossar = glossarData.tags;
        let finalReturnValue = "";
        // if ASSIGN_TOP is set -> return top categegory
        if (this.ASSIGN_TOP) {
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
}
exports.Taggy = Taggy;
function enrichWithOpenThesaurus(inputArray) {
    let enrichedArray = [];
    for (const word of inputArray) {
        // get baseforms from openthesaurus?
        openthesaurus_1.default.get(word).then((response) => {
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
