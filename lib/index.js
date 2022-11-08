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
class Taggy {
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param frequencyOutput Show frequency of identified tags
     * @param overrideOutput Show identified top tags with possibility to override default detection
     * @param options Optional: Provide options for taggys behaviour
     */
    constructor(inputField, outputField, frequencyOutput, overrideOutput, options) {
        // console.log("TAGGY CONFIG", this.config);
        this.name = "taggy";
        this.mostFrequentWords = [];
        this.mostFrequentTopTags = [];
        this.timeout = null;
        this.config = {
            use_tagify: configFile["use-tagify"] === "true",
            use_tagify_comment: configFile["use-tagify-comment"],
            waittime: configFile["waittime"],
            waittime_comment: configFile["waittime-comment"],
            opt_enabled: configFile["openthesaurus"] === "true",
            opt_enabled_comment: configFile["openthesaurus-comment"],
            assign_top: configFile.categories["assign-top"] === "true",
            assign_top_comment: configFile.categories["assign-top-comment"],
            include_top: configFile.categories["include-top"] === "true",
            include_top_comment: configFile.categories["include-top-comment"],
        };
        this.setInputField(inputField);
        this.outputField = outputField;
        this.winkTokenizer = new wink_tokenizer_1.default();
        this.stopwordsDE = stopwords_iso_1.default.de;
        this.openthesaurus = openthesaurus;
        if (this.outputField)
            this.outputField.setAttribute("readOnly", "true");
        if (this.config.use_tagify)
            this.createTagify(this.outputField);
        this.frequencyOutput = frequencyOutput;
        // this.overrideOutput = overrideOutput;
        if (overrideOutput) {
            this.setOverrideOutput(overrideOutput);
            if (this.config.use_tagify)
                this.createTagifyOverride(overrideOutput);
        }
        console.log("created a new taggy instance");
    }
    resetData() {
        this.mostFrequentTopTags = [];
        this.mostFrequentWords = [];
    }
    setInputField(inputField) {
        this.inputField = inputField;
        this.inputField.addEventListener("input", (event) => {
            this.handleInputEventListener();
        });
        console.log("taggy", "input field and handler set", this.inputField);
    }
    handleInputEventListener() {
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
            await this.processAndAddTags(this.inputField.value, this.outputField);
            this.outputField.style.backgroundColor = "#ffffff";
            this.tagify.DOM.scope.style.setProperty("--tags-border-color", "#b3d4fc");
            this.tagify.DOM.scope.style.setProperty("background", "#ffffff");
            // this.addTags(result);
        }, this.config.waittime);
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
    setOverrideOutput(overrideOutput) {
        this.overrideOutput = overrideOutput;
        this.overrideOutput.addEventListener("click", (event) => {
            this.handleOverrideOutputEventListener(event);
        });
        console.log("taggy", "Override field and handler set", this.overrideOutput);
    }
    handleOverrideOutputEventListener(event) {
        console.log("INSIDE EVENT LISTENER | OVERRIDE");
        const target = event.target;
        if (target)
            console.log(target.innerHTML);
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
    getMostFrequentWords() {
        console.log("most frequent called", this.mostFrequentWords);
        return this.mostFrequentWords;
    }
    createTagify(inputElement) {
        if (this.config.use_tagify && !this.tagify) {
            this.tagify = new tagify_1.default(inputElement);
        }
        return this.tagify;
    }
    createTagifyOverride(inputElement) {
        if (this.config.use_tagify) {
            if (!this.tagifyOverride) {
                this.tagifyOverride = new tagify_1.default(this.overrideOutput, {
                    userInput: false,
                });
            }
            this.tagifyOverride.on("click", (e) => {
                console.log(e.detail.data.value);
                this.addTags(e.detail.data.value);
            });
        }
    }
    async callOpenThesaurusAPI(inputArray) {
        let returnSet = [];
        // get synsets from openthesaurus?
        for await (const word of inputArray) {
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
                returnSet = this.tokenize(this.filterStopWords(optValues).toString());
            });
        }
        return returnSet;
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
        let processedInput = await this.processInput(input);
        this.addTags(processedInput[0]);
    }
    addTags(input) {
        this.tagify.removeAllTags();
        this.tagifyOverride.removeAllTags();
        if (input && input != "") {
            // set main tag for tagify
            if (this.config.use_tagify) {
                this.tagify.addTags(input);
            }
            else {
                this.outputField.setAttribute("value", input);
            }
            // set override tags
            if (this.overrideOutput && this.mostFrequentTopTags) {
                this.addOverrideOutput();
            }
            // set most frequent words
            this.addFrequencyOutput();
        }
    }
    addFrequencyOutput() {
        this.frequencyOutput.innerHTML =
            "Word(s) with most Occurencies: " +
                this.getMostFrequentWords()?.join(", ");
    }
    addOverrideOutput() {
        let topTags = [];
        Object.values(this.mostFrequentTopTags).forEach((element) => 
        // topTags.push(element.category + " (" + element.count + ")")
        topTags.push(element.category));
        if (this.overrideOutput) {
            if (this.config.use_tagify && this.tagifyOverride) {
                // this.overrideOutput.innerHTML =
                //   "Top detected categories: " + topTags.join(", ");
                this.tagifyOverride.addTags(topTags);
            }
            else {
                // this.overrideOutput.innerHTML =
                //   "Top detected categories: " + topTags.join(", ");
            }
        }
    }
    deleteTags() {
        console.log("called deleteTags");
        this.tagify.removeTags();
        this.tagifyOverride.removeAllTags();
    }
    tokenize(input, type = "word") {
        let tokenizedItems = this.winkTokenizer.tokenize(input);
        let returnSet = [];
        let tokenizedWords = tokenizedItems.filter((item) => {
            return item.tag === type;
        });
        tokenizedWords.forEach((element) => {
            returnSet.push(element.value);
        });
        return returnSet;
    }
    normalize(inputArray) {
        let normalizedValues = [];
        for (const element of inputArray) {
            normalizedValues.push(normalize_for_search_1.default(element));
        }
        return normalizedValues;
    }
    filterStopWords(inputArray) {
        return inputArray.filter((item) => !this.stopwordsDE.includes(item.value));
    }
    async processInput(input) {
        console.log("called processinput");
        this.resetData();
        // tokenize,filter out german stopword and normalize input (remove umlaute and transform to lowercase)
        let tokenizedValues = this.normalize(this.filterStopWords(this.tokenize(input, "word")));
        console.log("tokenized and normalized values", tokenizedValues);
        // return if input is too small
        if (tokenizedValues.length < 2)
            return [];
        let enrichedInputValues = [];
        // don't call openthesaurus-API too often (-> results in too many requests error)
        if (this.config.opt_enabled && tokenizedValues.length < 20) {
            enrichedInputValues = await this.callOpenThesaurusAPI(tokenizedValues);
        }
        // flat out arrays
        enrichedInputValues = enrichedInputValues
            .flat()
            .concat(tokenizedValues.flat());
        console.log("NORMALIZED/ENRICHED INPUTVALUES", enrichedInputValues);
        let glossarTags = [];
        let combinedWordsReturnSet = [];
        // if INCLUDE-TOP is set -> add top tag
        for (const category of glossarData.tags) {
            if (this.config.include_top) {
                console.log("INCLUDE TOP IS SET");
                console.log(category);
                glossarTags.push(normalize_for_search_1.default(category.name));
            }
            for (const word of category.words) {
                glossarTags.push(normalize_for_search_1.default(word));
                // check input for "whitespace-words"
                if (word.includes(" ")) {
                    if (normalize_for_search_1.default(input).includes(word)) {
                        let matchArray = normalize_for_search_1.default(input).matchAll(word);
                        for (let match of matchArray) {
                            combinedWordsReturnSet.push(match[0]);
                            console.log(match[0]);
                            console.log("whitespace-word match added", match[0]);
                        }
                    }
                }
            }
        }
        console.log("WORDS IN GLOSSAR", glossarTags);
        console.log("ENRICHED INPUTVALUES", enrichedInputValues);
        let returnValues = [];
        // look for matches in glossar
        for (const glossarValue of glossarTags) {
            for (const inputValue of enrichedInputValues) {
                if (inputValue == glossarValue) {
                    console.log("MATCH FOR", inputValue);
                    returnValues.push(inputValue);
                }
            }
        }
        console.log("COMBINEDWORDSRETURNSET", combinedWordsReturnSet);
        console.log("RETURN VALUES", returnValues);
        let finalSet = [...combinedWordsReturnSet].concat(returnValues);
        console.log("FINAL SET", finalSet);
        let topTagCount = [];
        let maxCount = 0;
        // if ASSIGN_TOP is set -> return top categegory
        if (this.config.assign_top) {
            let count = 0;
            // if INCLUDE_TOP ist set -> add top categories
            glossarData.tags.forEach((category) => {
                console.log("CATEGORY", category);
                count = 0;
                finalSet.forEach((element) => {
                    // if INCLUDE_TOP ist set -> add top categories
                    if (normalize_for_search_1.default(category.name) == element) {
                        count += 1;
                    }
                    if (this.normalize(category.words).includes(element)) {
                        count += 1;
                    }
                });
                topTagCount.push({
                    category: category.name,
                    count: count,
                });
                if (count > maxCount)
                    maxCount = count;
            });
            console.log("TOPCATFREQ", topTagCount);
            // console.log("SORTBY", sortBy(topTagCount, ["category", "count"]));
            // set most frequent top tags
            let groupedMostFrequentTopTags = lodash_1.groupBy(topTagCount, "count");
            if (groupedMostFrequentTopTags[maxCount][0].count) {
                this.mostFrequentTopTags = groupedMostFrequentTopTags[maxCount];
            }
        }
        // set most frequent matches
        this.mostFrequentWords = modeArray(finalSet);
        let finalValue = lodash_1.sample(this.mostFrequentWords);
        console.log("MOSTFREQUENT TOP TAGS", this.mostFrequentTopTags);
        // if ASSIGN_TOP is set -> return top categegory
        if (this.config.assign_top) {
            let topTags = [];
            Object.values(this.mostFrequentTopTags).forEach((element) => {
                if (element.count)
                    topTags.push(element.category);
            });
            console.log("topTAGS", topTags);
            let tempValue = lodash_1.sample(topTags);
            if (tempValue)
                finalValue = tempValue;
        }
        return finalValue ? [finalValue] : [""];
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
// return an array of mode element(s) -> highest occurrences
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