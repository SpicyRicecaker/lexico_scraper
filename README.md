A CLI app that takes in a word as an argument, and returns a JSON string of a `lexico.com` definition of that word.

The JSON output is in the form of a `(BigDefinition | BigEtymology)[]`, where 

```typescript
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
```


Run with 

```
Deno run --allow-net main.ts [term]
```
