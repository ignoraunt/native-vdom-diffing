const vdom = `
<h1>Heere folwen the wordes <br />betwene the Hoost and the Millere</h1>
<p>Whan that the Knyght had thus his tale ytoold,</p>
<span>When the Knight had thus told his tale,</span>
<p>In al the route nas ther yong ne oold</p>
<span>In all the company there was no one young nor old</span>
<p>That he ne seyde it was a noble storie</p>
<span>Who did not say it was a noble story</span>
<p>And worthy for to drawen to memorie,</p>
<span>And worthy to draw into memory,</span>
<p>And namely the gentils everichon.</p>
<span>And especially the gentlefolk every one.</span>`;

const dom = document.querySelector("#root");
const button = document.querySelector("button");

button.addEventListener("click", () => {
  dom.innerHTML = vdom;
});

// get the node type
function getNodeType(node) {
  if (node.nodeType == 1) {
    return node.tagName.toLowerCase();
  } else {
    return node.nodeType;
  }
}

console.log(getNodeType(dom))