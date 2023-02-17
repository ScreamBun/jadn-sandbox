import React from 'react'
import Markdown from "marked-react"


const SBMarkdown = (props: any) => {

    const markdown: string = `> Blockquote`
    const tableStruct = `
    | heading | b  |  c |  d  |
    | - | :- | -: | :-: |
    | cell 1 | cell 2 | 3 | 4 | 
    `;

    return (
        <div>
            <Markdown>
# Heading
Some *embedded* Markdown which `md-block` can convert for you!

## 
Second
            </Markdown>
        </div>

      )    
}
export default SBMarkdown;