# taggy | Open Semantic Tagging

<p align="center">
  <img width="240" alt="mtl-taggy" src="https://github.com/open-taggy/website/blob/main/static/img/logo.png">
</p>
<p align="center">
taggy is a typescript-based frontend package to automatically tag (or categorize) textual content
</p>

---

<img src="https://github.com/open-taggy/.github/blob/main/screencasts/screencast-shop_en_submit.gif" width="600" />


- **[try out the live-demo here](https://open-taggy.github.io/demo/)**

---
## Please Note

This here is to get you going quickly. 
For more information on taggy, more demos and extended docs, please [go here](https://github.com/open-taggy).

## Getting Started

**Import it via CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/@b1tsteller/taggy"></script>
```
**Or install taggy with npm:**

`npm install @b1tsteller/taggy`

**Then import the package and create a new instance with at least an input and an output-element:**
```node
import { Taggy } from "@b1tsteller/taggy";

let inputElement = document.getElementById('inputField');
let outputElement = document.getElementById("outputDiv");

let taggy = new Taggy(inputElement, outputElement);
```
- The input-element is a html-tag, preferably `<input>` or `<textarea>`, but can be everything holding text

- The output-element can be a html-tag of any kind, preferably `<div>`

**Get your glossary ready and adjust it to your needs:**

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
      "category": "Herbs and Spices",
      "keywords": ["Rosemary", "Parsley", "Pepper", "Thyme", "Mint", "Chilli", "Basil", "Dill"]
    },
    {
        "category": "Vegetables",
        "keywords": ["Potatoes", "Cucumber", "Garlic", "Carrots", "Spinach", "Onion", "Mushrooms"]
    },
    {
      "category": "Fish",
      "keywords": ["Salmon", "Tuna", "Red Snapper", "Sardines", "Herring", "Flounder", "Bass", "Mackerel"]
    }
  ]
}

```
**Retrieve detected single Tag:**

The input-element which was provided on instatiation will receive the parameter "value" with the detected tag in it. For example:

```html
<div id="outputDiv" value="Economy">
  <div class="taggy-tag">Economy</div>
</div>
```
**Retrieve multiple Tags:**

You can get multiple detected tags via the override-function, even when it's not visible to your users (e.g. "display: none"). Please make sure to turn it on (see options below). You'll get an element like this:

```html
<div id="override" value="Politics, Science">
  <div class="taggy-tag taggy-override">Politics</div>
  <div class="taggy-tag taggy-override">Science</div>
</div>
```


## Options
You can add additional params when creating the taggy object:
```node

let taggy = new Taggy(inputElement, outputElement, 
{ submitButton: submit, loaderElement: loaderDiv, includeTop: true });
```

| Parameter       | Type             | Info                                                                                                                               |
|-----------------|------------------|------------------------------------------------------------------------------------------------------------------------------------|
| submitButton    | HTMLElement      | Element (button) triggers analysis on click                                                                                        |
| frequencyOutput | HTMLSpanElement  | Element contains additional info on most occurencies of detected keywords                                                    |
| overrideOutput  | HTMLInputElement | Element shows multiple detected tags if analysis is not unambiguous                                                                |
| loaderElement   | HTMLElement      | Element (loader/spinner) that gets hidden on completion                                                                  |
| useSubmit       | boolean          | true -> analyze input while typing / false -> use of submit button to process ('submitButton' has to be defined) \| default: false |
| waittime        | number           | Duration for the time to wait until tags show up \| default: 1000                                                                  |
| language   | string      | Language Code in ISO 639-1; see list of available options below| default: "en"                                                                  |
| assignTop       | boolean          | true -> return category of found keyword / false -> return the keyword itself \| default: true                                     |
| includeTop      | boolean          | Include name of the categories themself as keywords \| default: false                                                              |
| messageNotFound | string           | Customize displayed message if no tag is found \| default "No matching tag found"                                              |
| openthesaurus   | boolean          | Add call to openthesaurus API to enrich words (experimental) \| default: false                                                     |

## Languages

taggy is language agnostic. But it's advised to define it, so common (and for this task irrelevant words) aka *stopwords* ("by", "a", "the", "also", "and", ...) in the input won't be processed. Below list from [here](https://www.npmjs.com/package/stopwords-iso)

| ISO 639-1 Code | Language |
| -------------- | -------- |
| af | Afrikaans |
| ar | Arabic |
| hy | Armenian |
| eu | Basque |
| bn | Bengali |
| br | Breton |
| bg | Bulgarian |
| ca | Catalan; Valencian |
| cs | Czech |
| zh | Chinese |
| da | Danish |
| de | German |
| nl | Dutch; Flemish |
| el | Greek, Modern (1453-) |
| en | English |
| eo | Esperanto |
| et | Estonian |
| fa | Persian |
| fi | Finnish |
| fr | French |
| ga | Irish |
| gl | Galician |
| gu | Gujarati |
| ha | Hausa |
| he | Hebrew |
| hi | Hindi |
| hr | Croatian |
| hu | Hungarian |
| id | Indonesian |
| it | Italian |
| ja | Japanese |
| ko | Korean |
| ku | Kurdish |
| la | Latin |
| lv | Latvian |
| lt | Lithuanian |
| mr | Marathi |
| ms | Malay |
| no | Norwegian |
| pl | Polish |
| pt | Portuguese |
| ro | Romanian; Moldavian; Moldovan |
| ru | Russian |
| sk | Slovak |
| sl | Slovenian |
| so | Somali |
| st | Sotho, Southern |
| es | Spanish; Castilian |
| sw | Swahili |
| sv | Swedish |
| tl | Tagalog |
| th | Thai |
| tr | Turkish |
| uk | Ukrainian |
| ur | Urdu |
| vi | Vietnamese |
| yo | Yoruba |
| zu | Zulu |
