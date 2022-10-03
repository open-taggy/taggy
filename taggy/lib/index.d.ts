/// <reference types="yaireo__tagify" />
import "regenerator-runtime/runtime";
import Tagify from "@yaireo/tagify";
export declare const taggy: {
    taggyVanilla: (input: string) => Promise<string[]>;
    createTagify: (inputElement: HTMLInputElement) => Tagify<Tagify.TagData>;
    addTags: (input: string) => Tagify<Tagify.TagData>;
    taggyCLI: () => void;
};
