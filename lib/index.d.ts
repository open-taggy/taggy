import "regenerator-runtime/runtime";
export interface IGlossaryData {
    tags: ITag[];
}
export interface ITag {
    category: string;
    keywords: string[];
}
export declare class Taggy {
    name: string;
    private glossaryData;
    private winkTokenizer;
    private stopwordsDE;
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
    options: {
        use_submit: boolean;
        waittime: number;
        assign_top: boolean;
        include_top: boolean;
        message_not_found: string;
        openthesaurus: boolean;
    };
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param submitButton Optional: Submit button to trigger processing instead of automatic behavior while typing
     * @param frequencyOutput Optional: Show frequency of identified tags
     * @param overrideOutput Optional: Show identified top tags with possibility to override default detection
     * @param loaderElement Optional: Add a loading indicator (spinner) that gets hidden on completion
     * @param options Optional: Provide options for taggy's behaviour
     */
    constructor(inputField: HTMLInputElement, outputField: HTMLInputElement, submitButton?: HTMLElement, frequencyOutput?: HTMLSpanElement, overrideOutput?: HTMLInputElement, loaderElement?: HTMLElement, options?: Object);
    resetData(): void;
    setInputField(inputField: HTMLInputElement): void;
    setSubmitButton(submitButton: HTMLElement): void;
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
