/// <reference types="yaireo__tagify" />
import "regenerator-runtime/runtime";
import Tagify from "@yaireo/tagify";
export declare class Taggy {
    name: string;
    private tagify;
    private tagifyOverride;
    private winkTokenizer;
    private stopwordsDE;
    private openthesaurus;
    private inputField;
    private outputField;
    private frequencyOutput;
    private overrideOutput;
    private mostFrequentWords;
    private mostFrequentTopTags;
    private timeout;
    config: {
        use_tagify: boolean;
        use_tagify_comment: any;
        waittime: any;
        waittime_comment: any;
        opt_enabled: boolean;
        opt_enabled_comment: any;
        assign_top: boolean;
        assign_top_comment: any;
        include_top: boolean;
        include_top_comment: any;
    };
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param frequencyOutput Show frequency of identified tags
     * @param overrideOutput Show identified top tags with possibility to override default detection
     * @param options Optional: Provide options for taggys behaviour
     */
    constructor(inputField: HTMLInputElement, outputField: HTMLInputElement, frequencyOutput: HTMLSpanElement, overrideOutput: HTMLInputElement, options: Object);
    resetData(): void;
    setInputField(inputField: HTMLInputElement): void;
    handleInputEventListener(): void;
    setOutputField(outputField: HTMLInputElement): void;
    setFrequencyOutput(frequencyOutput: HTMLSpanElement): void;
    setOverrideOutput(overrideOutput: HTMLInputElement): void;
    handleOverrideOutputEventListener(event: MouseEvent): void;
    getConfig(): Object;
    getGlossar(): JSON;
    setOption(option: string, value: boolean): void;
    getMostFrequentWords(): string[];
    createTagify(inputElement: HTMLInputElement): Tagify<Tagify.TagData>;
    createTagifyOverride(inputElement: HTMLInputElement): void;
    callOpenThesaurusAPI(inputArray: string[]): Promise<string[]>;
    process(input: string): Promise<string[]>;
    processAndAddTags(input: string, outputField: HTMLInputElement): Promise<void>;
    addTags(input: string): void;
    addFrequencyOutput(): void;
    addOverrideOutput(): void;
    deleteTags(): void;
    tokenize(input: string, type?: string): string[];
    normalize(inputArray: string[]): string[];
    filterStopWords(inputArray: any[]): any[];
    processInput(input: string): Promise<string[]>;
}
