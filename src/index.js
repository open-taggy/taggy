"use strict";
exports.__esModule = true;
exports.taggy = void 0;
var readline = require("readline");
var wink_tokenizer_1 = require("wink-tokenizer");
var stopwords_iso_1 = require("stopwords-iso"); // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
var normalize_for_search_1 = require("normalize-for-search");
var fs_1 = require("fs");
var winkTokenizer = new wink_tokenizer_1["default"]();
exports.taggy = {
    taggy: function () {
        // create shell input
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        var stopwordsDE = stopwords_iso_1["default"].de;
        rl.question("Input: ", function (input) {
            console.log("Tokens for \"" + input + "\":");
            // tokenize input
            var tokenizedItems = winkTokenizer.tokenize(input);
            var tokenizedWords = tokenizedItems.filter(function (item) {
                return item.tag === "word";
            });
            console.log(tokenizedItems);
            console.log(tokenizedWords);
            console.log(stopwordsDE);
            // filter out german stopwords
            var tokenizedWordsNoStop = tokenizedWords.filter(function (item) { return !stopwordsDE.includes(item.value.toLowerCase()); });
            // create array with only lowercase and normalized (remove ö and stuff)
            var tokenizedValues = [];
            for (var _i = 0, tokenizedWordsNoStop_1 = tokenizedWordsNoStop; _i < tokenizedWordsNoStop_1.length; _i++) {
                var element = tokenizedWordsNoStop_1[_i];
                tokenizedValues.push(normalize_for_search_1["default"](element.value.toLowerCase()));
            }
            console.log(tokenizedWordsNoStop);
            // console.log(tokenizedValues);
            console.log(process.cwd());
            // read glossar data
            var rawData = fs_1["default"].readFileSync("../taggy/data/glossar.json");
            var glossar = JSON.parse(rawData.toString());
            console.log(glossar);
            var glossarTags = glossar.tags;
            // look for matches in glossar
            for (var _a = 0, glossarTags_1 = glossarTags; _a < glossarTags_1.length; _a++) {
                var tag = glossarTags_1[_a];
                console.log(tag.name + ": ");
                for (var _b = 0, _c = tag.words; _b < _c.length; _b++) {
                    var word = _c[_b];
                    console.log("- " + word);
                    if (tokenizedValues.includes(word.toLowerCase())) {
                        console.log("-> MATCH");
                    }
                }
            }
            rl.close();
        });
    }
};
