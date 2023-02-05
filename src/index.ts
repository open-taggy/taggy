import tokenizer from "wink-tokenizer";
import stopwords from "stopwords-iso";
import normalizer from "normalize-for-search";
import { sample, groupBy } from "lodash";
import "regenerator-runtime/runtime";

export interface IGlossaryData {
  tags: ITag[];
}

export interface ITag {
  category: string;
  keywords: string[];
}

export interface IOptions {
  submitButton: HTMLElement | undefined;
  frequencyOutput: HTMLSpanElement | undefined;
  overrideOutput: HTMLInputElement | undefined;
  loaderElement: HTMLElement | undefined;
  useSubmit: boolean;
  waittime: number;
  assignTop: boolean;
  includeTop: boolean;
  messageNotFound: string;
  openthesaurus: boolean;
}

const openthesaurus = require("openthesaurus");
const glossaryData: IGlossaryData = require("../data/glossary.json");

export class Taggy {
  public name: string = "taggy";
  private glossaryData: IGlossaryData;
  private winkTokenizer: tokenizer;
  private stopwordsDE: any;
  private openthesaurus: any;
  private inputField!: HTMLInputElement;
  private outputField!: HTMLInputElement;
  private submitButton!: HTMLElement;
  private frequencyOutput: HTMLSpanElement | undefined;
  private overrideOutput!: HTMLInputElement;
  private loaderElement: HTMLElement | undefined;
  private mostFrequentWords: string[] = [];
  private mostFrequentTopTags: any[] = [];
  private timeout: any = null;

  public options: IOptions = {
    submitButton: undefined,
    frequencyOutput: undefined,
    overrideOutput: undefined,
    loaderElement: undefined,
    useSubmit: false,
    waittime: 1000,
    assignTop: true,
    includeTop: false,
    messageNotFound: "No matching tag found",
    openthesaurus: false,
  };
  //  * @param submitButton Optional: Submit button to trigger processing instead of automatic behavior while typing
  //  * @param frequencyOutput Optional: Show frequency of identified tags
  //  * @param overrideOutput Optional: Show identified top tags with possibility to override default detection
  //  * @param loaderElement Optional: Add a loading indicator (spinner) that gets hidden on completion

  /**
   * Create a new instance of taggy
   * @param inputField Input field where user text goes
   * @param outputField Output field where the tags will show up
   * @param options Optional: Provide options for taggy's behaviour
   */
  constructor(
    inputField: HTMLInputElement,
    outputField: HTMLInputElement,
    options?: IOptions
  ) {
    // if options get passed to constructor -> merge with existing options-object
    this.options = { ...this.options, ...options };

    // set demo-data for glossary
    this.glossaryData = glossaryData;

    if (options?.submitButton) {
      this.setSubmitButton(options.submitButton);
      this.options.useSubmit = true;
    } else {
      this.options.useSubmit = false;
      this.options.waittime = 500;
    }
    if (!inputField) throw new Error("No input-element provided for taggy");
    this.setInputField(inputField);
    if (!outputField) throw new Error("No output-element provided for taggy");
    this.outputField = outputField;
    if (options?.loaderElement) this.loaderElement = options.loaderElement;
    // this.submitButton = submitButton;

    this.winkTokenizer = new tokenizer();
    this.stopwordsDE = stopwords.de;
    this.openthesaurus = openthesaurus;

    if (options?.frequencyOutput)
      this.frequencyOutput = options.frequencyOutput;

    if (options?.overrideOutput) {
      this.setOverrideOutput(options.overrideOutput);
    }
  }

  resetData() {
    this.mostFrequentTopTags = [];
    this.mostFrequentWords = [];
  }

  setInputField(inputField: HTMLInputElement) {
    this.inputField = inputField;
    if (this.options.useSubmit && this.submitButton) {
      return;
      // fall back to eventlistener when no submitbutton specified
    } else {
      this.inputField.addEventListener("input", (event) => {
        this.handleInputEventListener();
      });
    }
  }

  setSubmitButton(submitButton: HTMLElement) {
    this.submitButton = submitButton;
    this.submitButton.addEventListener("click", (event) => {
      if (this.options.useSubmit) {
        this.handleSubmitButtonEventListener();
      }
    });
  }

  handleInputEventListener() {
    if (this.options.useSubmit) {
      return;
    }
    if (this.loaderElement)
      this.loaderElement.style.setProperty("display", "block");
    this.deleteTags();

    clearTimeout(this.timeout);

    // make a new timeout set to go off in 1000ms
    this.timeout = setTimeout(async () => {
      await this.processAndAddTags(this.inputField.value, this.outputField);
      this.loaderElement?.style.setProperty("display", "none");

      // this.addTags(result);
    }, this.options.waittime);
  }

  async handleSubmitButtonEventListener() {
    if (this.loaderElement) {
      this.loaderElement.style.setProperty("display", "block");
    }

    this.deleteTags();

    // set and hide loading-indicator
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      await this.processAndAddTags(this.inputField.value, this.outputField);
      if (this.loaderElement) {
        this.loaderElement.style.setProperty("display", "none");
      }
    }, this.options.waittime);
  }

  setOutputField(outputField: HTMLInputElement) {
    // outputField.setAttribute("value", "");
    outputField.readOnly = true;
    outputField.value = "";
    this.outputField = outputField;
  }

  setFrequencyOutput(frequencyOutput: HTMLSpanElement) {
    this.frequencyOutput = frequencyOutput;
  }

  setOverrideOutput(overrideOutput: HTMLInputElement) {
    this.overrideOutput = overrideOutput;

    this.overrideOutput.addEventListener("click", (event) => {
      this.handleOverrideOutputEventListener(event);
    });
  }

  handleOverrideOutputEventListener(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // prevent container above to be clickabe -> only tag-div itself
    if (event.target == event.currentTarget) return;
    if (target) this.addTags(target.innerHTML);
  }

  public getOptions(): Object {
    return this.options;
  }

  public getGlossary(): IGlossaryData {
    return this.glossaryData;
  }

  public setGlossary(glossaryToSet: IGlossaryData) {
    this.glossaryData = glossaryToSet;
  }

  public setOption(option: string, value: boolean) {
    if (option == "useSubmit") {
      this.options.useSubmit = value;
      if (value) {
        this.setSubmitButton(this.submitButton);
        this.setInputField(this.inputField);
      } else {
        this.setInputField(this.inputField);
      }
    }
    if (option == "assignTop") {
      this.options.assignTop = value;
    }
    if (option == "openthesaurus") {
      this.options.openthesaurus = value;
    }
    if (option == "includeTop") {
      this.options.includeTop = value;
    }
  }

  getMostFrequentWords() {
    return this.mostFrequentWords;
  }

  async callOpenThesaurusAPI(inputArray: string[]): Promise<string[]> {
    let returnSet: string[] = [];
    // get synsets from openthesaurus?
    for await (const word of inputArray) {
      await this.openthesaurus.get(word).then((response: any) => {
        let optValues: string[] = [];
        // response.baseforms?
        if (response && response.synsets[0]?.terms) {
          response.synsets[0].terms.forEach((term: any) => {
            optValues.push(normalizer(term.term));
          });
        }
        returnSet = this.tokenize(this.filterStopWords(optValues).toString());
      });
    }
    return returnSet;
  }

  async processAndAddTags(
    input: string,
    outputField: HTMLInputElement
  ): Promise<boolean> {
    this.deleteTags();
    let processedInput = await this.processInput(input);
    if (processedInput) {
      this.addTags(processedInput[0]);
      return Promise.resolve(true);
    }
    return Promise.reject(false);
  }

  addTags(input: string) {
    this.deleteTags();
    if (this.outputField.lastChild)
      this.outputField.removeChild(this.outputField.lastChild!);

    this.outputField.setAttribute("value", input);
    this.outputField.value = input;

    if (this.options.messageNotFound == "" && (!input || input == "")) {
      return;
    }

    const taggyTag = document.createElement("div");
    taggyTag.classList.add("taggy-tag");
    if (!input || input == "") {
      input = this.options.messageNotFound;
      taggyTag.classList.add("tag-not-found");
    } else {
      // set override tags
      if (this.overrideOutput && this.mostFrequentTopTags) {
        this.addOverrideOutput();
      }
      // set most frequent words
      this.addFrequencyOutput();
    }
    taggyTag.innerText = input;
    this.outputField.appendChild(taggyTag);
    // }
  }

  addFrequencyOutput() {
    if (this.frequencyOutput) {
      let frequencyList = [];
      // delete previous added words
      while (this.frequencyOutput.firstChild) {
        this.frequencyOutput.removeChild(this.frequencyOutput.firstChild);
      }
      // add new words
      this.getMostFrequentWords().forEach((word) => {
        let frequencySpan = document.createElement("span");
        frequencySpan.innerText = word;
        frequencySpan.classList.add("taggy-frequency");
        this.frequencyOutput?.appendChild(frequencySpan);
      });
    }
  }

  addOverrideOutput() {
    let topTags: string[] = [];
    Object.values(this.mostFrequentTopTags).forEach((element) =>
      topTags.push(element.category)
    );
    if (this.overrideOutput) {
      if (topTags.length > 1) {
        this.overrideOutput.setAttribute("value", topTags.join(", "));
        topTags.forEach((tag) => {
          let taggyTagOverride = document.createElement("div");
          taggyTagOverride.classList.add("taggy-tag", "taggy-override");
          taggyTagOverride.innerText = tag;

          this.overrideOutput.appendChild(taggyTagOverride);
        });
      }
    }
  }

  deleteTags() {
    // delete main tag
    if (this.outputField.lastChild)
      this.outputField.removeChild(this.outputField.lastChild!);

    // delete override tags
    if (this.overrideOutput) {
      while (this.overrideOutput.firstChild) {
        this.overrideOutput.removeChild(this.overrideOutput.firstChild);
      }
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
    this.resetData();

    // tokenize, filter out german stopwords and normalize input (remove umlaute and transform to lowercase)
    let tokenizedValues = this.normalize(
      this.filterStopWords(this.tokenize(input, "word"))
    );

    // return if input is too small
    if (tokenizedValues.length < 1) return [];

    let enrichedInputValues: string[] = [];

    // don't call openthesaurus-API too often (-> results in too many requests error)
    if (this.options.openthesaurus && tokenizedValues.length < 20) {
      enrichedInputValues = await this.callOpenThesaurusAPI(tokenizedValues);
    }
    // flat out arrays
    enrichedInputValues = enrichedInputValues
      .flat()
      .concat(tokenizedValues.flat());

    let glossaryTags: string[] = [];
    let combinedWordsReturnSet: string[] = [];

    // if INCLUDE-TOP is set -> add top tag
    for (const category of this.glossaryData.tags) {
      if (this.options.includeTop) {
        glossaryTags.push(normalizer(category.category));
      }
      for (const word of category.keywords) {
        glossaryTags.push(normalizer(word));
      }
    }

    // check input for words with whitespaces and "-"
    for (const word of glossaryTags) {
      if (word.includes(" ") || word.includes("-")) {
        if (normalizer(input).includes(word)) {
          combinedWordsReturnSet.push(word);
        }
      }
    }

    let returnValues: string[] = [];

    // look for matches in glossary
    for (const glossaryValue of glossaryTags) {
      for (const inputValue of enrichedInputValues) {
        if (inputValue == glossaryValue) {
          returnValues.push(inputValue);
        }
      }
    }

    let finalSet: string[] = [...combinedWordsReturnSet!].concat(returnValues);

    let topTagCount: any = [];

    let maxCount = 0;
    // if assignTop is set -> return top categegory
    if (this.options.assignTop) {
      let count = 0;
      // if includeTop ist set -> add top categories
      this.glossaryData.tags.forEach((category: any) => {
        count = 0;
        finalSet.forEach((element) => {
          // if includeTop ist set -> add top categories
          if (normalizer(category.category) == element) {
            count += 1;
          }
          if (this.normalize(category.keywords).includes(element)) {
            count += 1;
          }
        });
        topTagCount.push({
          category: category.category,
          count: count,
        });
        if (count > maxCount) maxCount = count;
      });

      // set most frequent top tags
      let groupedMostFrequentTopTags = groupBy(topTagCount, "count");
      if (groupedMostFrequentTopTags[maxCount][0].count) {
        this.mostFrequentTopTags = groupedMostFrequentTopTags[maxCount];
      }
    }

    // set most frequent matches
    this.mostFrequentWords = modeArray(finalSet)!;

    let finalValue = sample(this.mostFrequentWords)!;

    // if assignTop is set -> return top categegory
    if (this.options.assignTop) {
      let topTags: string[] = [];
      Object.values(this.mostFrequentTopTags).forEach((element) => {
        if (element.count) topTags.push(element.category);
      });

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
        enrichedArray.push(response.baseforms);
      }
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
