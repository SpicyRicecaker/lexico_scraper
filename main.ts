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

// there can be multiple `BigDefinition`s, which include whether the object is a noun or a verb
// then each BigDefinition 
interface BigDefinition {
    transitivity?: string,
    subMajorDefinitions: Definition[],
}

// some big definitions
interface Definition {
    transitivity? : string,
    definition: string,
    subDefinitions: SubDefinition[]
}

interface SubDefinition {
    transitivity?: string
    definition: string,
}

interface BigEtymology {
    title: string,
    // too hard to deal with these for now
    // senseRegister?: string,
    // This isn't english grammar but it's easier to code with so
    subMajorEtymologys: Etymology[],
}

// some big definitions
interface Etymology {
    phrase: string,
    definition: string,
    transitivity?: string,
    // too hard to deal with these for now
    // grammaticalNote?: string,
    subEtymologys: SubEtymology[]
}

interface SubEtymology {
    transitivity?: string
    definition: string,
}

async function getList(term: string): Promise<(BigDefinition | BigEtymology)[]> {
    try {
        const textResponse = await fetch(`https://www.lexico.com/en/definition/${term}`);
            const textData = await textResponse.text();

        const document = new DOMParser().parseFromString(textData, "text/html");
        if (!document) {
            console.log("unable to find webpage");
            Deno.exit(1);
        }

        let out: (BigDefinition | BigEtymology)[] = [];

        for (const bigDefinition of document.querySelectorAll(".entryWrapper > section.gramb")) {
            let bigDefinitionOut: BigDefinition = { subMajorDefinitions: [] };
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
                    let s = [];
                    for (const child of subDefinition.children) {
                        if (child.tagName === 'SPAN') {
                            s.push(child);
                        }
                    }
                    // let s = subDefinition.querySelectorAll(" span");
                    // console.log("before", subDefinition);
                    // console.log(s);
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

        for (const bigEtymology of document.querySelectorAll(".entryWrapper > section.etymology")) {
            let bigEtymologyOut: BigEtymology = { title: "", subMajorEtymologys: [] };
           
            if (bigEtymology.querySelector("h3.phrases-title")) {
                bigEtymologyOut.title = bigEtymology.querySelector("h3.phrases-title").innerText;
            } else {
                continue;
            }
            

            let phrases = bigEtymology.querySelectorAll("div.senseInnerWrapper > ul.semb.gramb > strong.phrase");
           
            let i = 0;
            for (const etymology of bigEtymology.querySelectorAll("div.senseInnerWrapper > ul.semb.gramb > ul.semb")) {
                let etymologyOut: Etymology = { phrase: phrases[i].innerText, definition: "", subEtymologys: [] };
                i++;
               
                let s = etymology.querySelectorAll(".trg > p > span");
               
                switch (s.length) {
                    case 2: {
                        etymologyOut.definition = s[1].innerText;
                        break;
                    }
                    case 3: {
                        etymologyOut.transitivity = s[1].innerText;
                        etymologyOut.definition = s[2].innerText;
                        break;
                    }
                    default: {
                        console.log("vital error occured while trying to select major Etymology", s)
                        break;
                    }
                }
                for (const subEtymology of etymology.querySelectorAll("ol.subSenses > li.subSense")) {
                    let subEtymologyOut: SubEtymology = { definition: "" };
                    // very new implementation, but let's hope deno has
                    // implemented it. worse case we can iterate over children
                    // of `subEtymologyOut` and just push it into a vector or
                    // something
                    let s = [];
                    for (const child of subEtymology.children) {
                        if (child.tagName === 'SPAN') {
                            s.push(child);
                        }
                    }
                    
                    switch (s.length) {
                        case 2: {
                            subEtymologyOut.definition = s[1].innerText;
                            break;
                        }
                        case 3: {
                            subEtymologyOut.transitivity = s[1].innerText;
                            subEtymologyOut.definition = s[2].innerText;
                            break;
                        }
                        default: {
                            console.log("vital error occured while trying to select minor Etymology", s)
                            break;
                        }
                    }
                    etymologyOut.subEtymologys.push(subEtymologyOut);
                }
                bigEtymologyOut.subMajorEtymologys.push(etymologyOut);
            }

            out.push(bigEtymologyOut);
        }

        return out;
    } catch (e) {
        console.log(e);
        Deno.exit(1);
    }

}

if (Deno.args[0]) {
    let res = await getList(Deno.args[0]);
    console.log(JSON.stringify(res, null, 2));
} else {
    console.log("please pass in term that you would like to define");
}
