# taggy | base package 🐓
taggy is a frontend package to automatically tag (or categorize) textual content.

---

This here is to get you going quickly. 
For more information on taggy, demos and extended docs, please [go here](https://github.com/open-taggy)


## Getting Started

1. Install taggy with npm:

`npm install @b1tsteller/taggy`

2. Import the package and create a new instance with at least an input and an output-element:
```node
import { Taggy } from "@b1tsteller/taggy-test2";

let taggy = new Taggy(inputElement, outputElement);
```
- The input-element is a html-tag, preferably `<input>` or `<textarea>`, but can be everything holding text

- The output-elment can be a html-tag of any kind, preferably `<div>`

3. Get your glossary ready and adjust it to your needs. Per default you can find it under `/data/glossary.json`. 

The structure is as follows:
```json
{
  "tags": [
    {
      "name": "First Category",
      "words": ["tag1", "tag2", "another-tag", "and-another-tag"]
    },
    {
      "name": "Second Category",
      "words": ["First one for #2", "Second one for #2"]
    },
    {
      "name": "A Third Category",
      "words": ["sub3-1", "sub3-2"]
    }
  ]
}

```
