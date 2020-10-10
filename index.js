var taxonomy = [];
const stater = () => {
    let taxItems = taxonomyData.split('\n');

    for (let item of taxItems) {
        let values = item.split(' - ');
        taxonomy.push(values);
    }

    document.querySelector('#result').value = '';
    document.querySelector('#go').disabled = true;

    let styles = [
        'width: 250px',
        'color: white',
        'display: block',
        'font-size: 30px',
        'text-align: center',
        'margin: 10px 0 0',
    ].join(';');
    let styles2 = [
        'background: linear-gradient(#1f3047, #4D7AB3)',
        'border: 1px solid #3E0E02',
        'width: 250px',
        'color: white',
        'display: block',
        'background: rgb(10,1,157)',
        'background: linear-gradient(166deg, rgba(10,1,157,1) 0%, rgba(11,117,14,1) 40%, rgba(11,121,9,1) 60%, rgba(0,212,255,1) 100%)',
        'line-height: 18px',
        'text-align: center',
        'font-weight: bold',
        'font-size: 14px',
        'margin: 0 0 18px',
        'padding: 10px 0 15px 0'
    ].join(';');

    console.log('%c💲💲🏆💲💲%c💥Google Shopping Maker💥\n👉all rights reserved👈', styles, styles2);
}
stater();

const SaveTextAsFile = () => {

    let textToSaveAsBlob = new Blob([xmlResult], { type: "text/plain" });
    let textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    let fileNameToSaveAs = document.querySelector('#save_name').value + '.xml';

    let downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

const destroyClickedElement = event => {
    document.body.removeChild(event.target);
}


var data = [];
var xmlStr = null;
async function loadFile(item) {
    let files = await selectFile("text/*", true);
    let fileToLoad = files[0];

    let fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
        item.innerHTML = '';

        let node = document.createElement("SPAN");
        node.innerHTML = 'dodaję';
        item.append(node);
        let node1 = document.createElement("SPAN");
        node1.innerHTML = '.';
        node1.id = 'wait1'
        item.append(node1);
        let node2 = document.createElement("SPAN");
        node2.innerHTML = '.';
        node2.id = 'wait2'
        item.append(node2);
        let node3 = document.createElement("SPAN");
        node3.innerHTML = '.';
        node3.id = 'wait3'
        item.append(node3);

        setTimeout(() => {
            strXML = fileLoadedEvent.target.result;

            let parser = new DOMParser();
            xmlStr = parser.parseFromString(strXML, 'text/xml');

            item.removeChild(node);
            item.removeChild(node1);
            item.removeChild(node2);
            item.removeChild(node3);

            item.innerHTML = 'dodany :)'

            let go = document.querySelector('#go');
            go.disabled = false;
            go.innerHTML = 'STWÓRZ PLIK'

        }, 230, fileLoadedEvent, xmlStr, node, node1, node2, node3, item);
    };

    fileReader.readAsText(fileToLoad);
}

const selectFile = (contentType, multiple) => {
    return new Promise(resolve => {
        input = document.createElement('input');
        input.type = 'file';
        input.multiple = multiple;
        input.accept = contentType;

        input.onchange = _ => {
            files = Array.from(input.files);
            if (multiple)
                resolve(files);
            else
                resolve(files.first);
        };

        input.click();
    });
}

const radio = item => {
    let elem = document.querySelectorAll('#' + item.parentElement.parentElement.id + ' input');
    for (let e of elem) {
        if (e.id != item.id) { e.checked = false }
    }
    item.checked = true;
}