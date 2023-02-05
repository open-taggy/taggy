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
    language: "en";
    assignTop: boolean;
    includeTop: boolean;
    messageNotFound: string;
    openthesaurus: boolean;
}
export declare class Taggy {
    name: string;
    private glossaryData;
    private winkTokenizer;
    private stopwords;
    private openthesaurus;
    private inputField;
    private outputField;
    private submitButton;
    private frequencyOutput;
    private overrideOutput;
    private loaderElement;
    private mostFrequentWords;
    private mostFrequentTopTags;
    private timeout;
    options: IOptions;
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param options Optional: Provide options for taggy's behaviour
     */
    constructor(inputField: HTMLInputElement, outputField: HTMLInputElement, options?: IOptions);
    resetData(): void;
    setInputField(inputField: HTMLInputElement): void;
    setSubmitButton(submitButton: HTMLElement): void;
    setLanguage(languageCode: string): void;
    handleInputEventListener(): void;
    handleSubmitButtonEventListener(): Promise<void>;
    setOutputField(outputField: HTMLInputElement): void;
    setFrequencyOutput(frequencyOutput: HTMLSpanElement): void;
    setOverrideOutput(overrideOutput: HTMLInputElement): void;
    handleOverrideOutputEventListener(event: MouseEvent): void;
    getOptions(): Object;
    getGlossary(): IGlossaryData;
    setGlossary(glossaryToSet: IGlossaryData): void;
    setOption(option: string, value: boolean): void;
    getMostFrequentWords(): string[];
    callOpenThesaurusAPI(inputArray: string[]): Promise<string[]>;
    processAndAddTags(input: string, outputField: HTMLInputElement): Promise<boolean>;
    addTags(input: string): void;
    addFrequencyOutput(): void;
    addOverrideOutput(): void;
    deleteTags(): void;
    tokenize(input: string, type?: string): string[];
    normalize(inputArray: string[]): string[];
    filterStopWords(inputArray: any[]): any[];
    processInput(input: string): Promise<string[]>;
}
