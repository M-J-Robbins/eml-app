window.onload = () => {
    updatePreview() 
};

let version = 'htmlPreview'

function updatePreview() {
    const parser = new DOMParser();
    let html = document.getElementById("html").value;
    email = parser.parseFromString(html, "text/html");
    if (version == 'htmlPreview'){

    }
    if (version == 'textPreview'){

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
        // if it has a background set background to none
        for (let item of elements) {
            if (item.style.backgroundImage !== '') {
                item.style.backgroundImage="none"
                console.log(item)
            }
        }
    }
    if (version == 'semanticPreview'){
        // remove CSS from <style> and <link> elements
        let css = email.querySelectorAll('link, style');
        Array.prototype.slice.call(css).forEach(function (remove) {
            remove.parentNode.removeChild(remove);
        });


        // remove hidden elements

        // remove inline styles
        // let inlineStyle = email.querySelectorAll('[style]');
        // for (let item of inlineStyle) {
        //     item.removeAttribute('style')
        // }

        
        // add default styles
    }

    let rendered = new XMLSerializer().serializeToString(email)
    document.getElementById("htmlPreview").setAttribute("srcdoc", rendered);
    
    console.log(version)


}


function htmlPreview(){
    version = 'htmlPreview'
    updatePreview() 
}
function textPreview(){
    version = 'textPreview'
    updatePreview() 
}
function noimagePreview(){
    version = 'noimagePreview'
    updatePreview() 
}
function semanticPreview(){
    version = 'semanticPreview'
    updatePreview() 
}