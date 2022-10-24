/// <reference types="yaireo__tagify" />
import "regenerator-runtime/runtime";
import Tagify from "@yaireo/tagify";
export declare class Taggy {
    private tagify;
    private winkTokenizer;
    private stopwordsDE;
    private inputField;
    private outputField;
    private frequencyOutput;
    private mostFrequent;
    private USE_TAGIFY;
    private OPENTHESAURUS_ENABLED;
    private ASSIGN_TOP;
    private INCLUDE_TOP;
    /**
     * Create a new instance of taggy
     * @param inputField Input field where user text goes
     * @param outputField Output field where the tags will show up
     * @param frequencyOutput Show frequency of identified tags
     * @param useTagify Optional: Use tagify dependency? Default: true
     */
    constructor(inputField: HTMLInputElement, outputField: HTMLInputElement, frequencyOutput: HTMLSpanElement, useTagify?: boolean);
    setInputField(inputField: HTMLInputElement): void;
    setOutputField(outputField: HTMLInputElement): void;
    setFrequencyOutput(frequencyOutput: HTMLSpanElement): void;
    setMostFrequent(input: string[]): void;
    getMostFrequent(): string[];
    createTagify(inputElement: HTMLInputElement): Tagify<Tagify.TagData>;
    process(input: string): Promise<string[]>;
    processAndAddTags(input: string, outputField: HTMLInputElement): Promise<string>;
    addTags(input: string): Tagify<Tagify.TagData>;
    deleteTags(): void;
    processInput(input: string): Promise<string[]>;
}
