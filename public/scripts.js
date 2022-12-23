window.onload = () => {
    updatePreview() 
};

let version = 'htmlPreview'

function updatePreview() {
    const parser = new DOMParser();
    // Get html from the textarea
    let html = document.getElementById("html").value;
    // For text version start by removing white space
    if (version == 'textPreview'){
        html = html.replace(/>\s+</g,'><');
    }
    // Parse HTML string into a DOM 
    email = parser.parseFromString(html, "text/html");
    trackingOpen(email)
    trackingLinks(email)
    if (version == 'textPreview'){
        removeHidden(email)
        // Delete any hidden content
        let hidden = email.querySelectorAll('[hidden]');
        Array.prototype.slice.call(hidden).forEach(function (remove) {
            remove.parentNode.removeChild(remove);
        });
        
        // Process what is left
        let elements = email.querySelectorAll("body *");
        for (let item of elements) {
            // Add bullets to lists
            if (item.tagName == "UL") {
                for (let li of item.children) {
                    li.insertAdjacentHTML("beforebegin", "* ");
                }
            }
            if (item.tagName == "OL") {
            var i = 1;
                for (let li of item.children) {
                    li.insertAdjacentHTML("beforebegin", i + " ");
                    i++;
                }
            }
            // add image alt text
            if (item.tagName == "IMG") {
                let alt = item.getAttribute("alt");
                if (alt != ''){
                    let alt = item.getAttribute("alt");
                    item.insertAdjacentHTML("afterend", " -[" + alt + "]");
                }
            }
            // add link with link text
            if (item.tagName == "A") {
                let href = item.getAttribute("href");
                item.insertAdjacentHTML("afterend", " -(" + href + ")");
            }
            // add spacing around elements
            if (["H1", "H2", "P", "UL", "OL", "TR"].includes(item.tagName)) {
                item.insertAdjacentHTML("afterend", `\n\n`);
            } else {
                item.insertAdjacentHTML("afterend", " ");
            }

        }
    
        // Get text content
        let plainText = email.body.textContent || email.body.innerText || "";
        plainText = plainText.replace(/^\s+\s/gm, "");

        // Add text to pre element to display it
        let pre = email.createElement("pre");
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.margin = '1rem';
        pre.innerText = plainText.trim()

        // clear body content
        email.body.innerText = ""
        // add plain text
        email.body.appendChild(pre)
    }
    if (version === 'noimagePreview'){
        // Collect images
        let images = email.querySelectorAll('img, picture source');
        // remove src and srcset
        for (let item of images) {
            if (item.hasAttribute('src')) {
                item.setAttribute('src', '')
            }
            if (item.hasAttribute('srcset')) {
                item.setAttribute('srcset', '')
            }
        }
        // Collect all elements
        let elements = email.querySelectorAll('*');
        // if it has a background set background to none !important
        for (let item of elements) {
            if (item.style.backgroundImage !== '') {
                item.style.setProperty('background-image', 'none', 'important');
            }
        }
    }
    if (version == 'semanticPreview'){
        removeHidden(email)
        // remove inline styles
        let inlineStyle = email.querySelectorAll('[style]');
        for (let item of inlineStyle) {
            item.removeAttribute('style')
        }
        // replace images
        let replaceImages = email.querySelectorAll('img');
        for (let item of replaceImages) {
            let newImg = email.createElement("replace-image");
            // set alt text
            let alt = ""
            if (item.hasAttribute('alt')) {
                alt = item.getAttribute('alt')
            } else {
                alt = item.getAttribute('src')
            }
            newImg.setAttribute('role', 'img')
            newImg.innerText = alt.trim();
            item.replaceWith(newImg);
        }
        // remove styling attributes
        const styleingAttributes = ["background", "bgcolor", "color", "text", "face", "size", "link", "alink", "vlink", "clear", "align", "width", "height", "hspace", "vspace", "bottommargin", "leftmargin", "rightmargin", "topmargin", "class", "id"];
        styleingAttributes.forEach(async function(attribute) {
            for (remove of email.querySelectorAll('[' + attribute + ']')) {
                remove.removeAttribute(attribute);
            };
        });
        // Find layout tables
        let layoutTables = email.querySelectorAll('table[role=presentation], table[role=none], table[role=presentation] * > tr > *, table[role=none] * > tr > *');
        for (let item of layoutTables) {
            item.setAttribute('class', 'layout')
        }
        // add default styles
        let defaultStyles = email.createElement("style")
        defaultStyles.innerHTML = `*:not([hidden]) {
                all: revert
            }
            [hidden]{
                display:none !important;
            }
            replace-image:not(:empty){
                display:inline-block;
                border:1px dashed;
                padding:.5em;
                max-width:100%;
                box-sizing:border-box;
            }
            table:not(.layout), th:not(.layout), td:not(.layout){
                border:1px solid;
                border-spacing:.2em;
                padding:.2em;
                word-break: normal;
            }
            table.layout, td.layout, th.layout{
                display:contents;
            }
            `;
        email.body.appendChild(defaultStyles)
    }

    let rendered = new XMLSerializer().serializeToString(email)
    document.getElementById("htmlPreview").setAttribute("srcdoc", rendered);
}


function htmlPreview(){
    version = 'htmlPreview'
    document.getElementById("buttonHtml").setAttribute("aria-checked", "true")
    document.getElementById("buttonText").setAttribute("aria-checked", "false")
    document.getElementById("buttonImage").setAttribute("aria-checked", "false")
    document.getElementById("buttonSemantic").setAttribute("aria-checked", "false")
    updatePreview() 
}
function textPreview(){
    version = 'textPreview'
    document.getElementById("buttonHtml").setAttribute("aria-checked", "false")
    document.getElementById("buttonText").setAttribute("aria-checked", "true")
    document.getElementById("buttonImage").setAttribute("aria-checked", "false")
    document.getElementById("buttonSemantic").setAttribute("aria-checked", "false")
    updatePreview() 
}
function noimagePreview(){
    version = 'noimagePreview'
    document.getElementById("buttonHtml").setAttribute("aria-checked", "false")
    document.getElementById("buttonText").setAttribute("aria-checked", "false")
    document.getElementById("buttonImage").setAttribute("aria-checked", "true")
    document.getElementById("buttonSemantic").setAttribute("aria-checked", "false")
    updatePreview() 
}
function semanticPreview(){
    version = 'semanticPreview'
    document.getElementById("buttonHtml").setAttribute("aria-checked", "false")
    document.getElementById("buttonText").setAttribute("aria-checked", "false")
    document.getElementById("buttonImage").setAttribute("aria-checked", "false")
    document.getElementById("buttonSemantic").setAttribute("aria-checked", "true")
    updatePreview() 
}

function removeHidden(email){
    // Remove CSS from <style> and <link> elements
    let css = email.querySelectorAll('link, style');
    Array.prototype.slice.call(css).forEach(function (remove) {
        remove.parentNode.removeChild(remove);
    });
    // Anything that is hidden, keep hidden
    let elements = email.querySelectorAll('*');
    for (let item of elements) {
        if (item.style.display == 'none') {
            item.setAttribute('hidden', '')
        }
    }
    let ariaHiddden = email.querySelectorAll('[aria-hidden="true"]');
    for (let item of ariaHiddden) {    
        item.setAttribute('hidden', '')
    }
}
function trackingOpen(email){
    let images = email.querySelectorAll('img');
    // list of known open tracking patterns 
    const opentrackers = ["parcel.io/e/o/", "openrate.aweber.com", "mjt.lu/oo", "resources.marketo.com/trk", "returnpath.net/pixel.gif", "nova.collect.igodigital.com"];
    for (let item of images) {    
        if (item.hasAttribute('src')) {
            src = item.getAttribute('src')
            if (opentrackers.some(v => src.includes(v))) {
                trackingStatus('true')
                break;
            } else if (item.width <= 1 && item.height <= 1){
                trackingStatus('maybe')
                break;
            } else {
                trackingStatus('false')
            }
        }
    }
}
function trackingStatus(track){
    const tracking = document.getElementById('openTracking');
    tracking.innerText = track; 
}
function trackingLinks(email){
    let links = email.querySelectorAll('a');
    // list of known link tracking patterns 
    const linktrackers = ["parcel.io/e/c/", "trk.klclick.com/ls/click", ".esclick.me", "?utm_", "&utm_"];
    for (let item of links) {
        if (item.hasAttribute('href')) {
            href = item.getAttribute('href')
            if (linktrackers.some(v => href.includes(v))) {
                linkTrackingStatus('true')
                break;
            } else {
                linkTrackingStatus('false')
            }
        }
    }
}
function linkTrackingStatus(track){
    const tracking = document.getElementById('clickTracking');
    tracking.innerText = track; 
}