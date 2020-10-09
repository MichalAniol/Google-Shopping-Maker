var taxonomy = [];
const stater = () => {
    let taxItems = taxonomyData.split('\n');

    for (let item of taxItems) {
        let values = item.split(' - ');
        taxonomy.push(values);
    }
}
stater();
console.log('%c taxonomy:', 'background: #ffcc00; color: #003300', taxonomy)
console.log('%c taxonomy:', 'background: #ffcc00; color: #003300', taxonomy[0][1])

const CopyToClipboard = containerid => {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select().createTextRange();
        document.execCommand("copy");
        range.moveToElementText(document.getElementById('end_copy'));
        range.select().createTextRange();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        range.selectNode(document.getElementById('end_copy'));
        window.getSelection().addRange(range);
    }
    let but = document.getElementById('copy_but');
    but.innerHTML = "c o p i e d &nbsp; ! ! !";
    setTimeout(() => {
        but.innerHTML = "Copy element";
    }, 500);
}


//----------------------

function saveTextAsFile() {
    memorise();
    let myObject = {
        memo: memo,
        x: document.getElementById('width').value,
        y: document.getElementById('height').value,
        cx: document.getElementById('cx').value,
        cy: document.getElementById('cy').value,
        vy: document.getElementById('vy').value,
        vx: document.getElementById('vx').value
    };

    let textToSaveAsBlob = new Blob([JSON.stringify(myObject, null, 2)], { type: "text/plain" });
    let textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    let fileNameToSaveAs = document.querySelector('.files input').value + '.json';

    let downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}


var data = [];
// Button callback
async function loadFile() {
    let files = await selectFile("text/*", true);
    let fileToLoad = files[0];

    let fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
        // JSON.parse(fileLoadedEvent.target.result);
        strXML = fileLoadedEvent.target.result;
        // console.log('%c strXML:', 'background: #ffcc00; color: #003300', strXML)

        var parser = new DOMParser();
        xmlStr = parser.parseFromString(strXML, 'text/xml');

        const ClearHolders = txt => txt.replace('<![', '![').replace(']]>', ']]')
        const AddHolders = txt => '<![CDATA[' + txt + ']]>';

        const GetValue = (parent, elems, value) => {
            let item = parent;
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];

                if (i + 1 == elems.length) {
                    let res = item.getElementsByTagName(elem)[0].getAttribute(value);
                    return res;
                } else {
                    item = item.getElementsByTagName(elem)[0];
                    if (item == null || typeof item == 'undefined') return null;
                }
            }
        }


        const GetInner = (parent, elems) => {
            let item = parent;
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];

                if (i + 1 == elems.length) {
                    let res = item.getElementsByTagName(elem)[0].innerHTML;
                    return res;
                } else {
                    item = item.getElementsByTagName(elem)[0];
                    if (item == null || typeof item == 'undefined') return null;
                }
            }
        }

        const GetElements = (parent, elems) => {
            let item = parent;
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];

                if (i + 1 == elems.length) {
                    let res = item.getElementsByTagName(elem);
                    return res;
                } else {
                    item = item.getElementsByTagName(elem)[0];
                    if (item == null || typeof item == 'undefined') return null;
                }
            }
        }


        const GetGoogleNum = name => taxonomy.find(e => e[1] == name);


        const Get_google_product_category = prod => {
            let path = GetValue(prod, ['iaiext:iai_category'], 'path');
            let item = GetGoogleNum(path);
            let google_num = item[0];
            return AddHolders(google_num)
        }

        const GetNavigation = prod => {
            let navigation = GetElements(prod, ['iaiext:navigation', 'iaiext:item']);
            console.log('%c navigation:', 'background: #ffcc00; color: #003300', navigation)
            let res = [];
            for (let item of navigation) {
                let name = item.getAttribute('textid');
                res.push(AddHolders(name));
            }
            return res;
        }


        const GetPrice = prod => {
            let price = GetValue(prod, ['price'], 'gross');
            if (Number(price) > 0) {
                return AddHolders(price + ' PLN');
            }

            price = GetValue(prod, ['srp'], 'gross');
            if (Number(price) > 0) {
                return AddHolders(price + ' PLN');
            }

            price = GetValue(prod, ['iaiext:srp'], 'gross');
            if (Number(price) > 0) {
                return AddHolders(price + ' PLN');
            }

            price = GetValue(prod, ['iaiext:strikethrough_retail_price'], 'gross');
            if (Number(price) > 0) {
                return AddHolders(price + ' PLN');
            }

            price = GetValue(prod, ['iaiext:strikethrough_wholesale_price'], 'gross');
            if (Number(price) > 0) {
                return AddHolders(price + ' PLN');
            }
        }

        const GetAvailable = prod => {
            let sizes = GetElements(prod, ['iaiext:sizes', 'iaiext:size'])
            let res = '';
            let list = [];
            for (let i = 0; i < sizes.length; i++) {
                let s = sizes[i];
                let available = s.getAttribute('available');
                if (available != 'unavailable') return AddHolders(available.replace('_', ' '))
            }


            return null;
        }

        const GetSizes = prod => {
            let sizes = GetElements(prod, ['iaiext:sizes', 'iaiext:size'])
            let res = '';
            let list = [];
            for (let i = 0; i < sizes.length; i++) {
                let s = sizes[i];
                let name = s.getAttribute('size_name');
                let available = s.getAttribute('available') != 'unavailable';
                if (!available) continue; 
                list.push(name);
            }

            for (let i = 0; i < list.length; i++) {
                let name = list[i];
                res += name + (i < list.length - 1 ? ', ' : '');
            }

            return AddHolders(res)
        }

        const GetWeight = prod => {
            let sizes = GetElements(prod, ['iaiext:sizes', 'iaiext:size'])
            let res = 0;
            let num = 0;
            for (let i = 0; i < sizes.length; i++) {
                let s = sizes[i];
                let weight = Number(s.getAttribute('weight'));
                let available = s.getAttribute('available') != 'unavailable';
                if (!available) continue;
                res += weight;
                num++;
            }
            res = (res / num).toString();

            return AddHolders(res)
        }

        let products = xmlStr.getElementsByTagName("product");
        console.log('%c products:', 'background: #ffcc00; color: #003300', products.length)
        data = [];
        let num = 0;


        for (let prod of products) {
            let visible = GetValue(prod, ['iaiext:visibility', 'iaiext:site'], 'visible') == 'yes';
            let availability = GetValue(prod, ['iaiext:availability', 'iaiext:site'], 'value') == 'yes';

            if (visible && availability) {
                num++
            } else {
                continue
            }
            console.log('%c id:', 'background: #ffcc00; color: #003300', num)

            let newItem = {
                id: AddHolders(GetValue(prod, ['iaiext:size'], 'code')),
                title: GetInner(prod, ['description', 'name']),
                description: GetInner(prod, ['short_desc']),
                google_product_category: Get_google_product_category(prod),
                product_type: GetNavigation(prod),
                link: AddHolders(GetValue(prod, ['card'], 'url')),
                image_link: AddHolders(GetValue(prod, ['iaiext:icons', 'iaiext:auction_icon'], 'url')),
                condition: '<![CDATA[new]]>',
                availability: GetAvailable(prod),
                price: GetPrice(prod),
                // gtin: null,
                // mpn: null,
                brand: AddHolders(GetValue(prod, ['producer'], 'producer')),
                size: GetSizes(prod),
                item_group_id: AddHolders(prod.getAttribute('id')),
                shipping_price: '<![CDATA[14.99 PLN]]>',
                shipping_weight: GetWeight(prod),
                adwords_grouping: AddHolders(GetValue(prod, ['category'], 'name'))
            }

            let code_producer = AddHolders(GetValue(prod, ['iaiext:sizes', 'iaiext:size'], 'code_producer'));
            if (prod.getAttribute('iaiext:producer_code_standard') == 'OTHER') {
                newItem.mpn = code_producer;
            } else {
                newItem.gtin = code_producer;
            }

            data.push(newItem)



        }

        console.log('%c added items:', 'background: red; color: #003300', num)
        console.log('%c data:', 'background: #ffcc00; color: #003300', data)

    };

    fileReader.readAsText(fileToLoad);
}


// ---- function definition ----
function selectFile(contentType, multiple) {
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


