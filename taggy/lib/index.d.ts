/// <reference types="yaireo__tagify" />
import "regenerator-runtime/runtime";
import Tagify from "@yaireo/tagify";
export declare class Taggy {
    name: string;
    tagify: Tagify;
    useTaggy: boolean;
    inputField: HTMLElement;
    outputField: HTMLElement;
    frequencyOutput: HTMLSpanElement;
    mostFrequent: string[];
    constructor(inputField: HTMLInputElement, outputField: HTMLInputElement, frequencyOutput: HTMLSpanElement, useTaggy?: boolean);
    hello(): string;
    setInputField(inputField: HTMLInputElement): void;
    setOutputField(outputField: HTMLInputElement): void;
    setFrequencyOutput(frequencyOutput: HTMLSpanElement): void;
    setMostFrequent(input: string[]): void;
    getMostFrequent(): string[];
    createTagify(inputElement: HTMLInputElement): Tagify<Tagify.TagData>;
    processInput(input: string): Promise<string[]>;
    processAndAddTags(input: string, outputField: HTMLOutputElement): Promise<HTMLOutputElement>;
    addTags(input: string): Tagify<Tagify.TagData>;
    deleteTags(): void;
}
export declare const taggy: {
    createTagify: (inputElement: HTMLInputElement) => Tagify<Tagify.TagData>;
    processInput: (input: string) => Promise<string[]>;
    addTags: (input: string) => Tagify<Tagify.TagData>;
    deleteTags: () => void;
    getMostFrequent: () => string[];
    taggyCLI: () => void;
};
