import * as readline from "readline";
import tokenizer from "wink-tokenizer";
import stopwords from "stopwords-iso"; // object of stopwords for multiple languages
// import stopwordsDE from de; // german stopwords
import normalizer from "normalize-for-search";
import {
  sample,
  filter,
  max,
  groupBy,
  sortBy,
  transform,
  random,
} from "lodash";
import "regenerator-runtime/runtime";
//import synonyms from "germansynonyms";
import Tagify from "@yaireo/tagify";

export interface IGlossaryData {
  tags: ITag[];
}

export interface ITag {
  name: string;
  words: string[];
}

// import jargon from "@clipperhouse/jargon";
// import stackexchange from "@clipperhouse/jargon/stackexchange"; // a dictionary
// include wink-nlp (lemmatizing)
const openthesaurus = require("openthesaurus");
const glossaryData: IGlossaryData = require("../data/glossary_DE-abo.json");
const configFile = require("../data/config.json");

export class Taggy {
  public name: string = "taggy";
  private tagify!: Tagify;
  private tagifyOverride!: Tagify;
  private glossaryData: IGlossaryData;
  private winkTokenizer: tokenizer;
  private stopwordsDE: any;
  private openthesaurus: any;
  private inputField!: HTMLInputElement;
  private outputField!: HTMLInputElement;
  private submitButton!: HTMLElement;
  private frequencyOutput: HTMLSpanElement;
  private overrideOutput!: HTMLInputElement;
  private loaderElement: HTMLElement;
  private mostFrequentWords: string[] = [];
  private mostFrequentTopTags: any[] = [];
  private timeout: any = null;

  public config = {
    use_tagify: configFile["use-tagify"] === "true",
    use_tagify_comment: configFile["use-tagify-comment"],
    use_submit: configFile["use-submit"] === "true",
    use_submit_comment: configFile["use-submit-comment"],
    waittime: configFile["waittime"],
    waittime_comment: configFile["waittime-comment"],
    opt_enabled: configFile["openthesaurus"] === "true",
    opt_enabled_comment: configFile["openthesaurus-comment"],
    assign_top: configFile.categories["assign-top"] === "true",
    assign_top_comment: configFile.categories["assign-top-comment"],
    include_top: configFile.categories["include-top"] === "true",
    include_top_comment: configFile.categories["include-top-comment"],
  };

  /**
   * Create a new instance of taggy
   * @param inputField Input field where user text goes
   * @param outputField Output field where the tags will show up
   * @param submitButton Submit button to trigger processing instead of automatic behavior while typing
   * @param frequencyOutput Show frequency of identified tags
   * @param overrideOutput Show identified top tags with possibility to override default detection
   * @param loaderElement Add a loading indicator (spinner) that gets hidden on completion
   * @param options Optional: Provide options for taggys behaviour
   */
  constructor(
    inputField: HTMLInputElement,
    outputField: HTMLInputElement,
    submitButton: HTMLElement,
    frequencyOutput: HTMLSpanElement,
    overrideOutput: HTMLInputElement,
    loaderElement: HTMLElement,
    options: Object
  ) {
    // console.log("TAGGY CONFIG", this.config);
    console.log("hello, this is taggy 0.3");
    this.glossaryData = glossaryData;

    this.setSubmitButton(submitButton);
    this.setInputField(inputField);
    this.outputField = outputField;
    this.loaderElement = loaderElement;
    // this.submitButton = submitButton;

    this.winkTokenizer = new tokenizer();
    this.stopwordsDE = stopwords.de;
    this.openthesaurus = openthesaurus;

    // if (this.outputField) this.outputField.setAttribute("readOnly", "true");
    if (this.config.use_tagify) this.createTagify(this.outputField);

    this.frequencyOutput = frequencyOutput;

    // this.overrideOutput = overrideOutput;
    if (overrideOutput) {
      this.setOverrideOutput(overrideOutput);
      if (this.config.use_tagify) this.createTagifyOverride(overrideOutput);
    }

    console.log("created a new taggy instance");
  }

  resetData() {
    this.mostFrequentTopTags = [];
    this.mostFrequentWords = [];
  }

  setInputField(inputField: HTMLInputElement) {
    this.inputField = inputField;
    console.log("SET INPUT FIELD");
    console.log(
      "USE_SUBMIT",
      this.config.use_submit,
      "BUTTON",
      this.submitButton
    );
    if (this.config.use_submit && this.submitButton) {
      return;
      // fall back to eventlistener when no submitbutton specified
    } else {
      this.inputField.addEventListener("input", (event) => {
        this.handleInputEventListener();
      });
      console.log("taggy", "input field and handler set", this.inputField);
    }
  }

  setSubmitButton(submitButton: HTMLElement) {
    console.log("SET SUBMIT BUTTON");
    this.submitButton = submitButton;
    this.submitButton.addEventListener("click", (event) => {
      console.log("SUBMIT BUTTON CLICKED");
      if (this.config.use_submit) {
        this.handleSubmitButtonEventListener();
      }
    });
    console.log("taggy", "submit button and handler set", this.submitButton);
  }

  handleInputEventListener() {
    console.log("INSIDE EVENT LISTENER | INPUT KEYSTROKE");
    if (this.config.use_submit) {
      console.log("but doing nothing");
      return;
    }
    // console.log("WAITTIME", this.config.waittime);
    // this.outputField.style.backgroundColor = "#f2f102";
    if (this.loaderElement)
      this.loaderElement.style.setProperty("display", "block");
    // if (this.outputField.lastChild)
    //   this.outputField.removeChild(this.outputField.lastChild!);
    this.deleteTags();

    if (this.tagify) {
      this.tagify.DOM.scope.style.setProperty("--tags-border-color", "#ef4d60");
      this.tagify.DOM.scope.style.setProperty("background", "#f2f102");
    }
    clearTimeout(this.timeout);

    // make a new timeout set to go off in 1000ms
    this.timeout = setTimeout(async () => {
      // loader.style.display = "block";

      await this.processAndAddTags(this.inputField.value, this.outputField);

      // this.outputField.style.backgroundColor = "#ffffff";
      this.loaderElement.style.setProperty("display", "none");

      if (this.tagify) {
        this.tagify.DOM.scope.style.setProperty(
          "--tags-border-color",
          "#b3d4fc"
        );
        this.tagify.DOM.scope.style.setProperty("background", "#ffffff");
      }

      // this.addTags(result);
    }, this.config.waittime);
  }

  async handleSubmitButtonEventListener() {
    console.log("INSIDE EVENT LISTENER | BUTTON");
    if (this.loaderElement) {
      console.log("EV before");
      console.log("loaderELEMENT", this.loaderElement);
      this.loaderElement.style.setProperty("display", "block");
    }

    this.deleteTags();

    // add loading-indicator -> helpful for UX
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      console.log("EV after");
      await this.processAndAddTags(this.inputField.value, this.outputField);
      if (this.loaderElement) {
        this.loaderElement.style.setProperty("display", "none");
      }
    }, this.config.waittime);
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

  setOverrideOutput(overrideOutput: HTMLInputElement) {
    this.overrideOutput = overrideOutput;

    this.overrideOutput.addEventListener("click", (event) => {
      this.handleOverrideOutputEventListener(event);
    });
    console.log("taggy", "Override field and handler set", this.overrideOutput);
  }

  handleOverrideOutputEventListener(event: MouseEvent) {
    console.log("INSIDE EVENT LISTENER | OVERRIDE");
    const target = event.target as HTMLElement;

    // prevent container above to be clickabe -> only tag-div itself
    if (event.target == event.currentTarget) return;
    if (target) console.log(target.innerHTML);
    this.addTags(target.innerHTML);
  }

  getConfig(): Object {
    return this.config;
  }

  getGlossary(): IGlossaryData {
    return this.glossaryData;
  }

  setGlossary(glossaryToSet: IGlossaryData) {
    this.glossaryData = glossaryToSet;
    console.log("set new glossary to", this.glossaryData);
  }

  setOption(option: string, value: boolean) {
    console.log("setting", option, "to", value);
    if (option == "use_tagify") {
      this.config.use_tagify = value;
      if (!value) {
        this.tagify.destroy();
        this.tagifyOverride.destroy();
      }
    }
    if (option == "use_submit") {
      console.log("USE_SUBMIT OPTION", value);
      this.config.use_submit = value;
      if (value) {
        // this.handleSubmitButtonEventListener();
        this.setSubmitButton(this.submitButton);
        console.log(this.inputField);
        // remove all event listeners from element
        // this.inputField.replaceWith(this.inputField.cloneNode(true));
        this.setInputField(this.inputField);

        // this.inputField.removeEventListener("input", (event) => {
        //   this.handleInputEventListener();
        // });
      } else {
        this.setInputField(this.inputField);

        // this.submitButton.replaceWith(this.submitButton.cloneNode(true));
        // this.handleInputEventListener();
      }
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

  createTagify(inputElement: HTMLInputElement) {
    if (this.config.use_tagify && !this.tagify) {
      this.tagify = new Tagify(inputElement, {
        userInput: false,
        editTags: false,
        transformTag: this.transformTagifyTag,
      });
      this.tagify.setReadonly(true);
      // this.tagify.DOM.scope.style.setProperty("--tag-bg", "#bee3f8");
      // this.tagify.DOM.scope.style.setProperty("--tag-text-color", "#2b6cb0");
      // this.tagify.DOM.scope.style.setProperty("--tag-border-radius", "12px");
      // this.tagify.DOM.scope.style.setProperty("--tag-pad", "0.6em");
      this.tagify.DOM.scope.style.setProperty("--readonly-striped", "0");
    }
    return this.tagify;
  }

  transformTagifyTag(tagData: Tagify.TagData) {
    let randomColor = getRandomColor();
    tagData.color = randomColor;
    console.log("randomColor", randomColor);

    tagData.style =
      "--tag-bg:" + tagData.color + ";" + "--tag-border-radius: 20px";

    function getRandomColor() {
      function rand(min: number, max: number) {
        return min + Math.random() * (max - min);
      }
      let h = rand(1, 360) | 0,
        s = rand(40, 70) | 0,
        l = rand(65, 72) | 0;

      return "hsl(" + h + "," + s + "%," + l + "%)";
    }
  }

  createTagifyOverride(inputElement: HTMLInputElement) {
    if (this.config.use_tagify) {
      if (!this.tagifyOverride) {
        this.tagifyOverride = new Tagify(this.overrideOutput!, {
          userInput: false,
          transformTag: this.transformTagifyTag,
        });
        this.tagifyOverride.DOM.scope.style.setProperty("border", "none");
      }
      this.tagifyOverride.on("click", (e) => {
        console.log(e.detail.data.value);
        this.addTags(e.detail.data.value);
      });
    }
  }

  async callOpenThesaurusAPI(inputArray: string[]): Promise<string[]> {
    let returnSet: string[] = [];
    // get synsets from openthesaurus?
    for await (const word of inputArray) {
      console.log("CALLING OPENTHESAURUS API");
      await this.openthesaurus.get(word).then((response: any) => {
        console.log(response);
        let optValues: string[] = [];
        // response.baseforms?
        if (response && response.synsets[0]?.terms) {
          console.log(response.synsets[0]?.terms);
          response.synsets[0].terms.forEach((term: any) => {
            optValues.push(normalizer(term.term));
          });
        }
        returnSet = this.tokenize(this.filterStopWords(optValues).toString());
      });
    }
    return returnSet;
  }

  // async process(input: string) {
  //   this.outputField.setAttribute("value", "");
  //   console.log("loaderElement", this.loaderElement);
  //   this.loaderElement.style.setProperty("display", "block");
  //   let processedInput = await this.processInput(input);
  //   this.loaderElement.style.setProperty("display", "none");
  //   console.log("processedinput", processedInput[0]);
  //   processedInput[0] = processedInput[0] ? processedInput[0] : "";
  //   this.outputField.setAttribute("value", processedInput[0]);
  //   return processedInput;
  // }

  async processAndAddTags(
    input: string,
    outputField: HTMLInputElement
  ): Promise<boolean> {
    console.log("awaiting processedInput");
    this.deleteTags();
    let processedInput = await this.processInput(input);
    if (processedInput) {
      console.log("done with processedInput");
      this.addTags(processedInput[0]);
      return Promise.resolve(true);
    }
    return Promise.reject(false);
  }

  addTags(input: string) {
    this.deleteTags();
    if (this.outputField.lastChild)
      this.outputField.removeChild(this.outputField.lastChild!);

    console.log("addtag", input);
    if (this.config.use_tagify) {
      if (!this.tagify) this.createTagify(this.outputField);
      if (!this.tagifyOverride) this.createTagifyOverride(this.overrideOutput!);
      this.tagify.removeAllTags();
      this.tagifyOverride.removeAllTags();
    }
    // if (input && input != "") {
    // set main tag for tagify
    if (this.config.use_tagify) {
      this.tagify.addTags(input);
    } else {
      this.outputField.setAttribute("value", input);
      this.outputField.value = input;
      console.log("field", this.outputField);
      const taggyTag = document.createElement("div");
      // taggyTag.classList.add("taggy-tag");
      // taggyTag.id = "taggy-tag";
      taggyTag.classList.add("taggy-tag");
      if (!input || input == "") {
        input = "No matching tag found";
        taggyTag.classList.add("not-found");
      } else {
        // }
        // set override tags
        if (this.overrideOutput && this.mostFrequentTopTags) {
          this.addOverrideOutput();
        }
        // set most frequent words
        this.addFrequencyOutput();
      }
      taggyTag.innerText = input;
      this.outputField.appendChild(taggyTag);
    }
  }

  addFrequencyOutput() {
    this.frequencyOutput.innerHTML =
      "Word(s) with most Occurencies: " +
      this.getMostFrequentWords()?.join(", ");
  }

  addOverrideOutput() {
    let topTags: string[] = [];
    Object.values(this.mostFrequentTopTags).forEach((element) =>
      // topTags.push(element.category + " (" + element.count + ")")
      topTags.push(element.category)
    );
    if (this.overrideOutput) {
      if (this.config.use_tagify && this.tagifyOverride) {
        // this.overrideOutput.innerHTML =
        //   "Top detected categories: " + topTags.join(", ");
        this.tagifyOverride.addTags(topTags);
      } else {
        // this.overrideOutput.value = topTags.join(", ");
        if (topTags.length > 1) {
          // let taggyTagOverrideTitle = document.createElement("h3");
          // taggyTagOverrideTitle.innerText =
          //   "Multiple possibilities found. Click to override main tag";
          // taggyTagOverrideTitle.classList.add("override-title");
          // this.overrideOutput.parentNode?.insertBefore(taggyTagOverrideTitle, this.overrideOutput);

          this.overrideOutput.setAttribute("value", topTags.join(", "));
          topTags.forEach((tag) => {
            let taggyTagOverride = document.createElement("div");
            // taggyTag.classList.add("taggy-tag");
            // taggyTagOverride.id = "taggy-tag";
            taggyTagOverride.classList.add("taggy-tag", "override");
            taggyTagOverride.innerText = tag;

            taggyTagOverride.classList.add(
              "bg-" + this.getRandomTwColor() + "-200"
            );

            this.overrideOutput.appendChild(taggyTagOverride);
          });

          // this.outputField.value = input;
          // console.log("field", this.outputField);
          // const taggyTag = document.createElement("div");
          // // taggyTag.classList.add("taggy-tag");
          // taggyTag.id = "taggy-tag";
          // taggyTag.innerText = input;
          // this.outputField.appendChild(taggyTag);
        }
      }
    }
  }

  getRandomTwColor(): string {
    const twColors = [
      "Red",
      "Orange",
      "Amber",
      "Yellow",
      "Lime",
      "Green",
      "Emerald",
      "Teal",
      "Cyan",
      "Sky",
      "Blue",
      "Indigo",
      "Violet",
      "Purple",
      "Fuchsia",
      "Pink",
      "Rose",
    ];

    return twColors[Math.floor(Math.random() * twColors.length)].toLowerCase();
  }

  deleteTags() {
    // delete tagify tags
    if (this.tagify) this.tagify.removeTags();
    if (this.tagifyOverride) this.tagifyOverride.removeAllTags();
    // this.overrideOutput.innerHTML = '';

    // delete main tag
    if (this.outputField.lastChild)
      this.outputField.removeChild(this.outputField.lastChild!);

    // delete override tags
    while (this.overrideOutput.firstChild) {
      console.log("REMOVE CHILD", this.overrideOutput.firstChild);
      this.overrideOutput.removeChild(this.overrideOutput.firstChild);
    }
  }

  tokenize(input: string, type: string = "word"): string[] {
    let tokenizedItems = this.winkTokenizer.tokenize(input);
    let returnSet: string[] = [];
    let tokenizedWords = tokenizedItems.filter((item) => {
      return item.tag === type;
    });
    tokenizedWords.forEach((element) => {
      returnSet.push(element.value);
    });
    return returnSet;
  }

  normalize(inputArray: string[]) {
    let normalizedValues = [];
    for (const element of inputArray) {
      normalizedValues.push(normalizer(element));
    }
    return normalizedValues;
  }

  filterStopWords(inputArray: any[]) {
    return inputArray.filter((item) => !this.stopwordsDE.includes(item.value));
  }

  async processInput(input: string): Promise<string[]> {
    console.log("called processinput");

    this.resetData();

    // tokenize,filter out german stopword and normalize input (remove umlaute and transform to lowercase)
    let tokenizedValues = this.normalize(
      this.filterStopWords(this.tokenize(input, "word"))
    );
    console.log("tokenized and normalized values", tokenizedValues);

    // return if input is too small
    if (tokenizedValues.length < 2) return [];

    let enrichedInputValues: string[] = [];

    // don't call openthesaurus-API too often (-> results in too many requests error)
    if (this.config.opt_enabled && tokenizedValues.length < 20) {
      enrichedInputValues = await this.callOpenThesaurusAPI(tokenizedValues);
    }
    // flat out arrays
    enrichedInputValues = enrichedInputValues
      .flat()
      .concat(tokenizedValues.flat());

    console.log("NORMALIZED/ENRICHED INPUTVALUES", enrichedInputValues);

    let glossaryTags: string[] = [];
    let combinedWordsReturnSet: string[] = [];

    // if INCLUDE-TOP is set -> add top tag
    for (const category of this.glossaryData.tags) {
      if (this.config.include_top) {
        console.log("INCLUDE TOP IS SET");
        console.log(category);
        glossaryTags.push(normalizer(category.name));
      }
      for (const word of category.words) {
        glossaryTags.push(normalizer(word));
      }
      // check input for words with whitespaces and "-"
    }

    for (const word of glossaryTags) {
      if (word.includes(" ") || word.includes("-")) {
        console.log("WORD WITH WHITE OR -", word);
        if (normalizer(input).includes(word)) {
          combinedWordsReturnSet.push(word);
          console.log("whitespace-word match added", word);

          // let matchArray = normalizer(input).matchAll(word);
          // for (let match of matchArray) {
          //   combinedWordsReturnSet.push(match[0]);
          //   console.log("whitespace-word match added", match[0]);
          // }
        }
      }
    }

    console.log("WORDS IN GLOSSARY", glossaryTags);
    console.log("ENRICHED INPUTVALUES", enrichedInputValues);

    let returnValues: string[] = [];

    // look for matches in glossary
    for (const glossaryValue of glossaryTags) {
      for (const inputValue of enrichedInputValues) {
        if (inputValue == glossaryValue) {
          console.log("MATCH FOR", inputValue);
          returnValues.push(inputValue);
        }
      }
    }

    console.log("COMBINEDWORDSRETURNSET", combinedWordsReturnSet);
    console.log("RETURN VALUES", returnValues);

    let finalSet: string[] = [...combinedWordsReturnSet!].concat(returnValues);

    console.log("FINAL SET", finalSet);

    let topTagCount: any = [];

    let maxCount = 0;
    // if ASSIGN_TOP is set -> return top categegory
    if (this.config.assign_top) {
      let count = 0;
      // if INCLUDE_TOP ist set -> add top categories
      this.glossaryData.tags.forEach((category: any) => {
        console.log("CATEGORY", category);
        count = 0;
        finalSet.forEach((element) => {
          // if INCLUDE_TOP ist set -> add top categories
          if (normalizer(category.name) == element) {
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
        if (count > maxCount) maxCount = count;
      });

      console.log("TOPCATFREQ", topTagCount);
      // console.log("SORTBY", sortBy(topTagCount, ["category", "count"]));

      // set most frequent top tags
      let groupedMostFrequentTopTags = groupBy(topTagCount, "count");
      if (groupedMostFrequentTopTags[maxCount][0].count) {
        this.mostFrequentTopTags = groupedMostFrequentTopTags[maxCount];
      }
    }

    // set most frequent matches
    this.mostFrequentWords = modeArray(finalSet)!;

    let finalValue = sample(this.mostFrequentWords)!;
    console.log("MOSTFREQUENT TOP TAGS", this.mostFrequentTopTags);

    // if ASSIGN_TOP is set -> return top categegory
    if (this.config.assign_top) {
      let topTags: string[] = [];
      Object.values(this.mostFrequentTopTags).forEach((element) => {
        if (element.count) topTags.push(element.category);
      });
      console.log("topTAGS", topTags);
      let tempValue = sample(topTags);
      if (tempValue) finalValue = tempValue;
    }

    return finalValue ? [finalValue] : [""];
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

// return an array of mode element(s) -> highest occurrences
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
