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
const openthesaurus = require("openthesaurus");
const glossarData = require("../data/glossar.json");
const configFile = require("../data/config.json");
let configDefinition;
class Taggy {
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param frequencyOutput Show frequency of identified tags
     * @param options Optional: Provide options for taggys behaviour
     */
    constructor(inputField, outputField, frequencyOutput, options) {
        this.name = "taggy";
        this.mostFrequent = [];
        this.timeout = null;
        this.config = configDefinition;
        this.USE_TAGIFY = configFile["use-tagify"] === "true";
        this.OPENTHESAURUS_ENABLED = configFile["openthesaurus"] === "true";
        this.ASSIGN_TOP = configFile.categories["assign-top"] === "true";
        this.INCLUDE_TOP = configFile.categories["include-top"] === "true";
        // config (again) -> TODO: SANITIZE CONFIG STUFF (ABOVE)
        this.config = {
            use_tagify: this.USE_TAGIFY,
            use_tagify_comment: configFile["use-tagify-comment"],
            waittime: configFile["waittime"],
            waittime_comment: configFile["waittime-comment"],
            opt_enabled: this.OPENTHESAURUS_ENABLED,
            opt_enabled_comment: configFile["openthesaurus-comment"],
            assign_top: this.ASSIGN_TOP,
            assign_top_comment: configFile.categories["assign-top-comment"],
            include_top: this.INCLUDE_TOP,
            include_top_comment: configFile.categories["include-top-comment"],
        };
        console.log("TAGGY CONFIG", this.config);
        this.setInputField(inputField);
        this.outputField = outputField;
        this.winkTokenizer = new wink_tokenizer_1.default();
        this.stopwordsDE = stopwords_iso_1.default.de;
        this.openthesaurus = openthesaurus;
        if (this.outputField)
            this.outputField.setAttribute("readOnly", "true");
        this.frequencyOutput = frequencyOutput;
        console.log("created a new taggy instance");
    }
    setInputField(inputField) {
        this.inputField = inputField;
        this.inputField.addEventListener("input", (event) => {
            this.handleEventListener();
        });
        console.log("taggy", "input field and handler set", this.inputField);
    }
    handleEventListener() {
        console.log("INSIDE EVENT LISTENER");
        // console.log("WAITTIME", this.config.waittime);
        this.outputField.style.backgroundColor = "#f2f102";
        if (this.tagify) {
            this.tagify.DOM.scope.style.setProperty("--tags-border-color", "#ef4d60");
            this.tagify.DOM.scope.style.setProperty("background", "#f2f102");
        }
        clearTimeout(this.timeout);
        // make a new timeout set to go off in 1000ms
        this.timeout = setTimeout(async () => {
            // loader.style.display = "block";
            let result = await this.processAndAddTags(this.inputField.value, this.outputField);
            this.outputField.style.backgroundColor = "#ffffff";
            this.addTags(result);
        }, this.config.waittime);
        console.log(this.outputField.style.backgroundColor);
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
    getConfig() {
        return this.config;
    }
    getGlossar() {
        return glossarData;
    }
    setOption(option, value) {
        console.log("setting", option, "to", value);
        if (option == "use_tagify") {
            this.config.use_tagify = value;
        }
        if (option == "assign_top") {
            this.config.assign_top = value;
        }
        if (option == "opt_enabled") {
            this.config.opt_enabled = value;
        }
        if (option == "include_top") {
            this.config.include_top = value;
        }
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
        if (this.tagify?.DOM?.scope?.parentNode) {
            console.log("before destroy", this.tagify);
            this.tagify.destroy();
            console.log("after destroy", this.tagify);
        }
        let processedInput = await this.processInput(input);
        // let mostFrequent = taggy.getMostFrequent();
        this.outputField.setAttribute("value", processedInput[0]);
        outputField.value = processedInput[0];
        // TODO -> modularize
        if (this.config.use_tagify) {
            this.tagify = this.createTagify(outputField);
            this.tagify.removeAllTags();
            this.tagify.addTags(processedInput[0]);
        }
        return processedInput[0];
    }
    addTags(input) {
        if (this.config.use_tagify) {
            this.tagify.addTags(input);
        }
        else {
            this.outputField.setAttribute("value", input);
        }
        if (input && input != "") {
            this.addFrequencyOutput();
        }
        console.log("ADDTAG BG", this.outputField.style.backgroundColor);
    }
    addFrequencyOutput() {
        this.frequencyOutput.innerHTML =
            "Top candidates: " + this.getMostFrequent().join(", ");
    }
    deleteTags() {
        console.log("called deleteTags");
        this.tagify.removeTags();
    }
    tokenize(input, type = "word") {
        let tokenizedItems = this.winkTokenizer.tokenize(input);
        let tokenizedWords = tokenizedItems.filter((item) => {
            return item.tag === type;
        });
        return tokenizedWords;
    }
    async processInput(input) {
        console.log("called processinput");
        let tokenizedWords = this.tokenize(input, "word");
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
        if (this.config.opt_enabled && tokenizedValues.length < 20) {
            // get baseforms from openthesaurus?
            for await (const word of tokenizedValues) {
                // enrichedInputValues.push(word);
                console.log("CALLING OPENTHESAURUS API");
                await this.openthesaurus.get(word).then((response) => {
                    console.log(response);
                    let optValues = [];
                    // response.baseforms?
                    if (response && response.synsets[0]?.terms) {
                        console.log(response.synsets[0]?.terms);
                        response.synsets[0].terms.forEach((term) => {
                            optValues.push(normalize_for_search_1.default(term.term));
                        });
                    }
                    console.log("PRE FILTER", optValues);
                    // filter out german stopwords
                    let optValuesNoStop = optValues.filter((item) => !this.stopwordsDE.includes(item));
                    console.log("AFTER FILTER", optValuesNoStop);
                    let optValuesTokenized = this.tokenize(optValuesNoStop.toString(), "word");
                    console.log("FINAL FILTER", optValuesTokenized);
                    optValuesTokenized.forEach((element) => {
                        enrichedInputValues.push(element.value);
                    });
                    console.log("LOOT", enrichedInputValues);
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
        for (const category of glossarData.tags) {
            // if INCLUDE-TOP is set -> add top tag
            if (this.config.include_top) {
                console.log(category);
                glossarTags.push(normalize_for_search_1.default(category.name));
            }
            for (const word of category.words) {
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
        // if ASSIGN_TOP is set -> return top categegory
        if (this.config.assign_top) {
            searchGlossar.forEach((category) => {
                console.log(category);
                category.words.forEach((word) => {
                    if (normalize_for_search_1.default(word) == finalValue) {
                        console.log("MATCH FOR", category.name);
                        finalValue = category.name;
                    }
                });
            });
        }
        return finalValue ? [finalValue] : [""];
        // console.log(returnValue);
    }
}
exports.Taggy = Taggy;
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
