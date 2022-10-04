/// <reference types="yaireo__tagify" />
import "regenerator-runtime/runtime";
import Tagify from "@yaireo/tagify";
export declare const taggy: {
    createTagify: (inputElement: HTMLInputElement) => Tagify<Tagify.TagData>;
    processInput: (input: string) => Promise<string[]>;
    addTags: (input: string) => Tagify<Tagify.TagData>;
    deleteTags: () => void;
    getMostFrequent: () => string[];
    taggyCLI: () => void;
};
