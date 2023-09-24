// fetched template from, say, component function
// (keys obviously should not be hardcoded,
// but that's the different story)
const template = `
<h1 class="could-also-change-attributes-independently">Heere folwen the wordes <br />betwene the Hoost and the Millere</h1>
<p key="1">Whan that the Knyght had thus his tale ytoold,</p>
<span key="6">When the Knight had thus told his tale,</span>
<p key="2">In al the route nas ther yong ne oold</p>
<span key="7">In all the company there was no one young nor old</span>
<p key="3">That he ne seyde it was a noble storie</p>
<span key="8">Who did not say it was a noble story</span>
<p key="4">And worthy for to drawen to memorie,</p>
<span key="9">And worthy to draw into memory,</span>
<p key="5">And namely the gentils everichon.</p>
<span>And especially the gentlefolk every one.</span>`;

// get the node to be re-rendered
const dom = document.querySelector('#root');

// convert the template string to nodes
function parse(template) {
  let parser = new DOMParser();
  let parsedTemplate = parser.parseFromString(template, 'text/html');
  removeEmptyTextNodes(parsedTemplate.body);
  return parsedTemplate.body;
}

// get the node type
function getNodeType(node) {
  if (node.nodeType == 1) {
    return node.tagName.toLowerCase();
  } else {
    return node.nodeType;
  }
}

// strip parsed template of empty text nodes
function removeEmptyTextNodes(node) {
  for (let i = 0; i < node.childNodes.length; i++) {
    let child = node.childNodes[i];
    if (
      child.nodeType === 8 ||
      (child.nodeType === 3 &&
        !/\S/.test(child.nodeValue) &&
        child.nodeValue.includes('\n'))
    ) {
      node.removeChild(child);
      i--;
    } else if (child.nodeType === 1) {
      if (child.hasAttribute('key')) {
        let key = child.getAttribute('key');
        child.key = key;
        child.removeAttribute('key');
      }
      removeEmptyTextNodes(child);
    }
  }
}

// get attributes indices
function getAttributeIndex(element) {
  let attributes = {};
  if (element.attributes == undefined) return attributes;
  for (let i = 0, atts = element.attributes, n = atts.length; i < n; i++) {
    attributes[atts[i].name] = atts[i].value;
  }
  return attributes;
}

// update attributes
function patchAttributes(vdom, dom) {
  let vdomAttributes = getAttributeIndex(vdom);
  let domAttributes = getAttributeIndex(dom);
  if (vdomAttributes == domAttributes) return;
  Object.keys(vdomAttributes).forEach((key, i) => {
    // add the attribute if not present ...
    if (!dom.getAttribute(key)) {
      dom.setAttribute(key, vdomAttributes[key]);
    } // ... otherwise compare them
    else if (dom.getAttribute(key)) {
      if (vdomAttributes[key] != domAttributes[key]) {
        dom.setAttribute(key, vdomAttributes[key]);
      }
    }
  });
  Object.keys(domAttributes).forEach((key, i) => {
    // remove the attribute if not present in the vdom
    if (!vdom.getAttribute(key)) {
      dom.removeAttribute(key);
    }
  });
}

// check if the node has a key
function hasKey(dom, key) {
  let keymatched = false;
  for (let i = 0; i < dom.children.length; i++) {
    if (key == dom.children[i].key) {
      keymatched = true;
      break;
    }
  }
  return keymatched;
}

function patchKeys(vdom, dom) {
  // remove a key from the dom if unmatched
  for (let i = 0; i < dom.children.length; i++) {
    let dnode = dom.children[i];
    let key = dnode.key;
    if (key) {
      if (!hasKey(vdom, key)) {
        dnode.remove();
      }
    }
  }
  // add keys to the dom
  for (let i = 0; i < vdom.children.length; i++) {
    let vnode = vdom.children[i];
    let key = vnode.key;
    if (key) {
      if (!hasKey(dom, key)) {
        // add a key if it's not present in the dom
        let nthIndex = [].indexOf.call(vnode.parentNode.children, vnode);
        if (dom.children[nthIndex]) {
          dom.children[nthIndex].before(vnode.cloneNode(true));
        } else {
          dom.append(vnode.cloneNode(true));
        }
      }
    }
  }
}

// main diffing function
function compareDOMs(vdom, dom) {
  // append vdom children if the dom has no children
  if (dom.hasChildNodes() == false && vdom.hasChildNodes() == true) {
    for (let i = 0; i < vdom.childNodes.length; i++) {
      dom.append(vdom.childNodes[i].cloneNode(true));
    }
  } else {
    patchKeys(vdom, dom);

    // remove dom nodes if the dom has more children than the vdom
    if (dom.childNodes.length > vdom.childNodes.length) {
      let count = dom.childNodes.length - vdom.childNodes.length;
      if (count > 0) {
        for (; count > 0; count--) {
          dom.childNodes[dom.childNodes.length - count].remove();
        }
      }
    }

    // compare all the children
    for (let i = 0; i < vdom.childNodes.length; i++) {
      // append if the vdom node is not present in the dom
      if (dom.childNodes[i] == undefined) {
        dom.append(vdom.childNodes[i].cloneNode(true));
      } else if (
        getNodeType(vdom.childNodes[i]) == getNodeType(dom.childNodes[i])
      ) {
        // if the node type is the same ...
        // ... and if the nodeType is text ...
        if (vdom.childNodes[i].nodeType == 3) {
          // ... check if the text content is not the same ...
          if (vdom.childNodes[i].textContent != dom.childNodes[i].textContent) {
            // ... replace the text content
            dom.childNodes[i].textContent = vdom.childNodes[i].textContent;
          }
        }
      } else {
        // ... else replace the node
        dom.childNodes[i].replaceWith(vdom.childNodes[i].cloneNode(true));
      }
      if (vdom.childNodes[i].nodeType != 3) {
        compareDOMs(vdom.childNodes[i], dom.childNodes[i]);
      }
    }
  }
}

// assign the parsed template
const vdom = parse(template);

removeEmptyTextNodes(dom);

// handle the render
const button = document.querySelector('button');
button.addEventListener('click', function () {
  compareDOMs(vdom, dom);
});
