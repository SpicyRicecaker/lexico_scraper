import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
// import { assert } from "https://deno.land/std@0.146.0/testing/asserts.ts";
// <div class="entryWrapper">
//     <section class="gramb">  <!-- the overarching wrapper for a definition, there can be multiple -->
//         <span class="transitivity"></span> <!-- we want innertext here, for sure -->
//         <ul class="semb"> <!-- where the definitions are -->
//             <li> <!-- each "major entry" for a term -->
//                 <div class="trg"> <!-- another wrapper for the li -->
//                     <p>
//                         <!--another span is here, what we want is the second sibling -->
//                         <span></span> <!--the definition is within the span, we 100% want inner text again-->
//                     </p>
//                 </div>
//                 <!-- ... -->
//                 <ol class="subSenses">
//                     <li class="subSense">
//                         <!--another span is here, what we want is the second sibling -->
//                         <span></span>
//                     </li>
//                 </ol>
//             </li> 
//             <li></li>
//             <li></li>
//             <!-- ... -->
//         </ul>
//     </section>
// <section class="etymology">
//     <h3 class="phrases-title"></h3>
//     <div class="senseInnerWrapper">
//         <ul class="semb gramb">
//             <strong class="phrase"></strong>
//             <span class="sense-registers"></span>
//             <ul class="semb"> <!-- identical to the above major entry, I think -->
//                 <li>
//                     <div class="trg">
//                         <p>
//                             <span></span>
//                             <span></span>
//                         </p>
//                     </div>
//                 </li>
//             </ul>
//         </ul>
//     </div>
// </section>
// </div>

enum Kind {
    Regular = "Regular",
        Etymology = "Etymology"
}
// there can be multiple `BigDefinition`s, which include whether the object is a noun or a verb
// then each BigDefinition 
interface BigDefinition {
    // both
    kind: Kind,
    // regular only [
    transitivity? string,
    // ]

    // Etymology only [
    title?: string,
    // may be multiple, ff
    senseRegister?: string,
    // ]
    subMajorDefinitions: Definition[],
}

// some big definitions
interface Definition {
    grammaticalNote? : string,
    definition: string,
    subDefinitions: SubDefinition[]
}

interface SubDefinition {
    grammaticalNote?: string
    definition: string,
}

// interface Etymology {
//     subMajorDefinitions: Definition[]
// }

async function getList(term: string): BigDefinition[] {
    try {
        const textResponse = await fetch(`https://www.lexico.com/en/definition/${term}`);
            const textData = await textResponse.text();

        const document = new DOMParser().parseFromString(textData, "text/html");

        let out: BigDefinition[] = [];

        for (const bigDefinition of document.querySelectorAll(".entryWrapper > section.gramb")) {
            let bigDefinitionOut: BigDefinition = { subMajorDefinitions: [], kind: Kind.Regular };
            if (bigDefinition.querySelector(".transitivity")) {
                bigDefinitionOut.transitivity = bigDefinition.querySelector(".transitivity").innerText;
            }
            for (const definition of bigDefinition.querySelectorAll("ul.semb > li")) {
                let definitionOut: Definition = { definition: "", subDefinitions: [] };
                let s = definition.querySelectorAll(".trg > p > span");
                switch (s.length) {
                    case 2: {
                        definitionOut.definition = s[1].innerText;
                        break;
                    }
                    case 3: {
                        definitionOut.transitivity = s[1].innerText;
                        definitionOut.definition = s[2].innerText;
                        break;
                    }
                    default: {
                        console.log("vital error occured while trying to select major definition", s)
                        break;
                    }
                }
                for (const subDefinition of definition.querySelectorAll("ol.subSenses > li.subSense")) {
                    let subDefinitionOut: SubDefinition = { definition: "" };
                    // very new implementation, but let's hope deno has
                    // implemented it. worse case we can iterate over children
                    // of `subDefinitionOut` and just push it into a vector or
                    // something
                    let s = subDefinition.querySelectorAll(":scope > span");
                    switch (s.length) {
                        case 2: {
                            subDefinitionOut.definition = s[1].innerText;
                            break;
                        }
                        case 3: {
                            subDefinitionOut.transitivity = s[1].innerText;
                            subDefinitionOut.definition = s[2].innerText;
                            break;
                        }
                        default: {
                            console.log("vital error occured while trying to select minor definition", s)
                            break;
                        }
                    }
                    definitionOut.subDefinitions.push(subDefinitionOut);
                }
                bigDefinitionOut.subMajorDefinitions.push(definitionOut);
            }

            for (const etymology of bigDefinition.querySelector(".entryWrapper > section.etymology")) {
                let etymologyOut: BigDefinition = { subMajorDefinitions: [], kind: Kind.Etymology };

                etymologyOut.title = bigDefinition.querySelector("h3.phrases-title").innerText;

                let phraseTitles = bigDefinition.querySelectorAll("div.senseInnerWrapper > ul.semb.gramb > strong.phrase");
                let i = 0;
                for (const phrase of bigDefinition.querySelectorAll("div.senseInnerWrapper > ul.semb.gramb > ul.semb") {
                    for (const definition of phrase.querySelectorAll(":scope > li")) {
                        let definitionOut: Definition = { definition: "", subDefinitions: [] };
                        let s = definition.querySelectorAll(".trg > p > span");
                        switch (s.length) {
                            case 2: {
                                definitionOut.definition = s[1].innerText;
                                break;
                            }
                            case 3: {
                                definitionOut.transitivity = s[1].innerText;
                                definitionOut.definition = s[2].innerText;
                                break;
                            }
                            default: {
                                console.log("vital error occured while trying to select major definition", s)
                                break;
                            }
                        }
                        for (const subDefinition of definition.querySelectorAll("ol.subSenses > li.subSense")) {
                            let subDefinitionOut: SubDefinition = { definition: "" };
                            // very new implementation, but let's hope deno has
                            // implemented it. worse case we can iterate over children
                            // of `subDefinitionOut` and just push it into a vector or
                            // something
                            let s = subDefinition.querySelectorAll(":scope > span");
                            switch (s.length) {
                                case 2: {
                                    subDefinitionOut.definition = s[1].innerText;
                                    break;
                                }
                                case 3: {
                                    subDefinitionOut.transitivity = s[1].innerText;
                                    subDefinitionOut.definition = s[2].innerText;
                                    break;
                                }
                                default: {
                                    console.log("vital error occured while trying to select minor definition", s)
                                    break;
                                }
                            }
                            definitionOut.subDefinitions.push(subDefinitionOut);
                        }
                        bigDefinitionOut.subMajorDefinitions.push(definitionOut);
                    }
                }


            }

            for (const etymology of document.querySelector(".entryWrapper > section.etymology")) {
                let definitionOut: Definition = { definition: "", subDefinitions: [] };
                let s = definition.querySelectorAll(".trg > p > span");
                switch (s.length) {
                    case 2: {
                        definitionOut.definition = s[1].innerText;
                        break;
                    }
                    case 3: {
                        definitionOut.transitivity = s[1].innerText;
                        definitionOut.definition = s[2].innerText;
                        break;
                    }
                    default: {
                        console.log("vital error occured while trying to select major definition", s)
                        break;
                    }
                }
                for (const subDefinition of definition.querySelectorAll("ol.subSenses > li.subSense")) {
                    let subDefinitionOut: SubDefinition = { definition: "" };
                    // very new implementation, but let's hope deno has
                    // implemented it. worse case we can iterate over children
                    // of `subDefinitionOut` and just push it into a vector or
                    // something
                    let s = subDefinition.querySelectorAll(":scope > span");
                    switch (s.length) {
                        case 2: {
                            subDefinitionOut.definition = s[1].innerText;
                            break;
                        }
                        case 3: {
                            subDefinitionOut.transitivity = s[1].innerText;
                            subDefinitionOut.definition = s[2].innerText;
                            break;
                        }
                        default: {
                            console.log("vital error occured while trying to select minor definition", s)
                            break;
                        }
                    }
                    definitionOut.subDefinitions.push(subDefinitionOut);
                }
                bigDefinitionOut.subMajorDefinitions.push(definitionOut);
            }

            out.push(bigDefinitionOut);
        }

        return out;
    } catch (e) {
        console.log(e);
        Deno.exit(1);
    }

}

if (Deno.args[0]) {
    let res = await getList(Deno.args[0]);
    console.log(JSON.stringify(res));
} else {
    console.log("please pass in term that you would like to define");
}
