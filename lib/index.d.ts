/// <reference types="yaireo__tagify" />
import "regenerator-runtime/runtime";
import Tagify from "@yaireo/tagify";
export declare class Taggy {
    name: string;
    private tagify;
    private winkTokenizer;
    private stopwordsDE;
    private openthesaurus;
    private inputField;
    private outputField;
    private frequencyOutput;
    private mostFrequent;
    private timeout;
    config: {
        use_tagify: boolean;
        use_tagify_comment: string;
        waittime: number;
        waittime_comment: string;
        opt_enabled: boolean;
        opt_enabled_comment: string;
        assign_top: boolean;
        assign_top_comment: string;
        include_top: boolean;
        include_top_comment: string;
    };
    private USE_TAGIFY;
    private OPENTHESAURUS_ENABLED;
    private ASSIGN_TOP;
    private INCLUDE_TOP;
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param frequencyOutput Show frequency of identified tags
     * @param options Optional: Provide options for taggys behaviour
     */
    constructor(inputField: HTMLInputElement, outputField: HTMLInputElement, frequencyOutput: HTMLSpanElement, options: Object);
    setInputField(inputField: HTMLInputElement): void;
    handleEventListener(): void;
    setOutputField(outputField: HTMLInputElement): void;
    setFrequencyOutput(frequencyOutput: HTMLSpanElement): void;
    setMostFrequent(input: string[]): void;
    getConfig(): Object;
    getGlossar(): JSON;
    setOption(option: string, value: boolean): void;
    getMostFrequent(): string[];
    createTagify(inputElement: HTMLInputElement): Tagify<Tagify.TagData>;
    process(input: string): Promise<string[]>;
    processAndAddTags(input: string, outputField: HTMLInputElement): Promise<string>;
    addTags(input: string): void;
    addFrequencyOutput(): void;
    deleteTags(): void;
    tokenize(input: string, type?: string): any[];
    processInput(input: string): Promise<string[]>;
}
