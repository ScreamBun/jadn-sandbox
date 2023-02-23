import { marked } from "marked";

// ALLOWS LINE BREAKS WITH RETURN BUTTON
marked.setOptions({
    breaks: true,
});
  
// INSERTS target="_blank" INTO HREF TAGS (required for codepen links)
const renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
    return `<a target="_blank" href="${href}">${text}</a>`;
}
  
export function markdownToHTML(markdownText: string) {
    try{
       return marked(markdownText, { renderer: renderer });
    }catch (error) {
    console.error("Something bad happened");
    return error;
  }
}