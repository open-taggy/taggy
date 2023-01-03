# taggy | Open Semantic Tagging

<p align="center">
  <img width="240" alt="mtl-taggy" src="https://github.com/open-taggy/website/blob/main/static/img/logo.png">
</p>
<p align="center">
taggy is a frontend package to automatically tag (or categorize) textual content.
</p>

---

<img src="https://github.com/open-taggy/.github/blob/main/screencasts/screencast-shop_en_submit.gif" width="600" />


- **[try out the live-demo here](https://open-taggy.github.io/demo/)**

---
## Please Note

This here is to get you going quickly. 
For more information on taggy, more demos and extended docs, please [go here](https://github.com/open-taggy).

## Getting Started

**1. Install taggy with npm:**

`npm install @b1tsteller/taggy`

**2. Import the package and create a new instance with at least an input and an output-element:**
```node
import { Taggy } from "@b1tsteller/taggy-test2";

let taggy = new Taggy(inputElement, outputElement);
```
- The input-element is a html-tag, preferably `<input>` or `<textarea>`, but can be everything holding text

- The output-element can be a html-tag of any kind, preferably `<div>`

**3. Get your glossary ready and adjust it to your needs.**

The default comes integrated under `/data/glossary.json` with the data shown below.
But you definetly want to use your own :)

You can set it like this:

```node
import myGlossary from "../data/my-glossary.json";

taggy.setGlossary(myGlossary);
```

The structure is as follows:
```json
{
  "tags": [
    {
      "name": "Herbs and Spices",
      "words": ["Rosemary", "Parsley", "Pepper", "Thyme", "Mint", "Chilli", "Basil", "Dill"]
    },
    {
        "name": "Vegetables",
        "words": ["Potatoes", "Cucumber", "Garlic", "Carrots", "Spinach", "Onion", "Mushrooms"]
    },
    {
      "name": "Fish",
      "words": ["Salmon", "Tuna", "Red Snapper", "Sardines", "Herring", "Flounder", "Bass", "Mackerel"]
    }
  ]
}

```
