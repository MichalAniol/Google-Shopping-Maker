var taxonomy = [];
const stater = () => {
    let taxItems = taxonomyData.split('\n');

    for (let item of taxItems) {
        let values = item.split(' - ');
        taxonomy.push(values);
    }

    document.querySelector('#result').value = '';
    document.querySelector('#go').disabled = true;
}
stater();

//----------------------

function SaveTextAsFile() {

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

function destroyClickedElement(event) {
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

function radio(item) {
    let elem = document.querySelectorAll('#' + item.parentElement.parentElement.id + ' input');
    for (let e of elem) {
        if (e.id != item.id) { e.checked = false }
    }
    item.checked = true;
}

var xmlResult = '';
const AddTooXml = item => {
    xmlResult += `      <item>
        <g:id>`+ item.id + `</g:id>
        <title>`+ item.title + `</title>
        <description>`+ item.description + `</description>\n`;

    if (item.google_product_category) xmlResult += `        <g:google_product_category>` + item.google_product_category + `</g:google_product_category>\n`;

    for (let typ of item.product_type) {
        xmlResult += `        <g:product_type>` + typ + `</g:product_type>\n`
    }

    xmlResult += `        <link>` + item.link + `</link>
        <g:display_ads_link>`+ item.display_ads_link + `</g:display_ads_link>\n`;


    if (item.image_link) xmlResult += `        <g:image_link>` + item.image_link + `</g:image_link>\n`

    xmlResult += `        <g:condition>` + item.condition + `</g:condition>
        <g:availability>`+ item.availability + `</g:availability>
        <g:price>`+ item.price + `</g:price>\n`;

    if (item.gtin) {
        xmlResult += `        <g:gtin>` + item.gtin + `</g:gtin>\n`
    }

    if (item.mpn) {
        xmlResult += `        <g:mpn>` + item.mpn + `</g:mpn>\n`
    }

    xmlResult += `        <g:brand>` + item.brand + `</g:brand>
        <g:size>`+ item.size + `</g:size>
        <g:item_group_id>`+ item.item_group_id + `</g:item_group_id>
        <g:shipping>
          <g:price>`+ item.shipping_price + `</g:price>
        </g:shipping>
        <g:shipping_weight>`+ item.shipping_weight + `</g:shipping_weight>
        <adwords_grouping>`+ item.adwords_grouping + `</adwords_grouping>
      </item>\n`;
}

const finalize = () => {
    xmlResult = '<?xml version="1.0" encoding="UTF-8"?>\n  <rss xmlns:g="http://base.google.com/ns/1.0" xmlns:iaiext="http://www.iai-shop.com/developers/iof/extensions.phtml" xmlns:functx="http://www.functx.com" version="2.0">\n    <channel>\n';

    let size_all = document.querySelector('#size_all').checked;
    let shipping_price = document.querySelector('#shipping_price').value;
    let condition = document.querySelector('#condition').value;

    let button = document.querySelector('#go');
    // button.innerHTML = '';

    // let node = document.createElement("SPAN");
    // node.innerHTML = 'czekaj';
    // button.append(node);
    // let node1 = document.createElement("SPAN");
    // node1.innerHTML = '.';
    // node1.id = 'wait1'
    // button.append(node1);
    // let node2 = document.createElement("SPAN");
    // node2.innerHTML = '.';
    // node2.id = 'wait2'
    // button.append(node2);
    // let node3 = document.createElement("SPAN");
    // node3.innerHTML = '.';
    // node3.id = 'wait3'
    // button.append(node3);


    let products, num, index, ready, interval;
    setTimeout(() => {
        products = xmlStr.getElementsByTagName("product");
        num = 0;

        index = 0;
        ready = false;

        // button.removeChild(node);
        // button.removeChild(node1);
        // button.removeChild(node2);
        // button.removeChild(node3);

        interval = setInterval(() => {
            if (index >= products.length) {
                clearInterval(interval);
                ready = true;
                xmlResult += '  </channel>\n</rss>'
                return;
            }
            prod = products[index];
            index++;

            let visible = GetValue(prod, ['iaiext:visibility', 'iaiext:site'], 'visible') == 'yes';
            let availability = GetValue(prod, ['iaiext:availability', 'iaiext:site'], 'value') == 'yes';
            let availability_size = GetAvailable(prod);

            if (visible && availability && availability_size) {
                num++
            } else {
                return
            }

            let newItem = {
                id: AddHolders(GetValue(prod, ['sizes', 'size'], 'code')),
                title: GetInner(prod, ['description', 'name']),
                description: GetDescription(prod),
                google_product_category: Get_google_product_category(prod),
                product_type: GetNavigation(prod),
                link: AddHolders(GetValue(prod, ['card'], 'url')),
                display_ads_link: GetValue(prod, ['card'], 'url'),
                image_link: GetImg(prod),
                condition: '<![CDATA[' + condition + ']]>',
                availability: availability_size,
                price: GetPrice(prod),
                gtin: null,
                mpn: null,
                brand: AddHolders(GetValue(prod, ['producer'], 'name')),
                size: GetSizes(prod, size_all),
                item_group_id: AddHolders(prod.getAttribute('id')),
                shipping_price: '<![CDATA[' + shipping_price + ']]>',
                shipping_weight: GetWeight(prod),
                adwords_grouping: AddHolders(GetValue(prod, ['category'], 'name'))
            }

            let code_producer = (GetValue(prod, ['iaiext:sizes', 'iaiext:size'], 'code_producer'));
            if (code_producer) {
                if (prod.getAttribute('iaiext:producer_code_standard') == 'OTHER') {
                    newItem.mpn = AddHolders(code_producer);
                } else {
                    newItem.gtin = AddHolders(code_producer);
                }
            }

            AddTooXml(newItem);
            // console.log('%c newItem:', 'background: #ffcc00; color: #003300', newItem)
            button.innerHTML = '' + (index) + ' z ' + products.length;
        }, 0,
            index, data, products, num, size_all, shipping_price, condition, ready, button, xmlResult);
    }, 30,
        xmlResult, size_all, shipping_price, condition, button, products, num, index, ready, interval
        // , node, node1, node2, node3
        );

    let intervalEnd = setInterval(() => {
        if (ready) {


            clearInterval(intervalEnd)
            button.innerHTML = 'Dodano ' + num + ' produktow !!!';

            document.querySelector('.save_area').style.display = 'flex';
            document.querySelector('#result').style.display = 'initial';

            document.querySelector('#result').value = xmlResult;
        } else {

        }
    }, 300, ready, button, xmlResult);
}