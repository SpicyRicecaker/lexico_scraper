A CLI app that takes in a word as an argument, and returns a JSON string of a `lexico.com` definition of that word.

The JSON is in the form of a `BigDefinition[]`, where 

```typescript

// whether this definition applies to a verb, noun, or adjective
interface BigDefinition {
    transitivity?: string,
    subMajorDefinitions: Definition[]
}

// the major definition of that specific context of the word
interface Definition {
    grammaticalNote? : string,
    definition: string,
    subDefinitions: SubDefinition[]
}

// possible submeanings
interface SubDefinition {
    grammaticalNote?: string
    definition: string,
}
```


Run with 

```
Deno run --allow-net main.ts [term]
```
