const ClearHolders = txt => txt.replace('<![', '![').replace(']]>', ']]')
const AddHolders = txt => '<![CDATA[' + txt + ']]>';

const GetValue = (parent, elems, value) => {
    let item = parent;
    for (let i = 0; i < elems.length; i++) {
        let elem = elems[i];

        if (i + 1 == elems.length) {
            item = item.getElementsByTagName(elem)[0];
            if (item) {
                let res = item.getAttribute(value);
                return res;
            } else {
                return null;
            }
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
            item = item.getElementsByTagName(elem)[0];
            if (item) {
                let res = item.innerHTML;
                return res;
            } else {
                return null
            }
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

const GetDescription = prod => {
    let description = GetInner(prod, ['iaiext:meta_description'])
    if (description == null) {
        description = GetInner(prod, ['short_desc']);
        if (description == null) {
            description = GetInner(prod, ['description', 'name']);
        }
    }

    return description;
}


const Get_google_product_category = prod => {
    let path = GetValue(prod, ['category_idosell'], 'path');
    if (!path) return null;


    let pos = path.indexOf('&gt;')
    let index = 10;
    while (pos > -1) {
        if (index < 0) break;
        path = path.replace('&gt;', '>')
        pos = path.indexOf('&gt;')
        index--;
    }

    let item = GetGoogleNum(path);

    index = 10;
    while (!item) {
        if (index <= 0) { item = null; break; }
        let pos = path.lastIndexOf(' > ');
        if (pos < 0) { break }
        path = path.substr(0, pos);

        item = GetGoogleNum(path);
        index--;
    }


    index = 10;
    while (typeof item == 'undefined') {
        if (index <= 0) { item = null; break; }
        let pos = path.lastIndexOf(' > ');
        if (pos < 0) { break }
        path = path.substr(0, pos);

        item = GetGoogleNum(path);
        index--;
    }

    if (item) {
        let google_num = item[0];
        return AddHolders(google_num)
    } else {
        return null;
    }
}


const GetNavigation = prod => {
    let navigation = GetElements(prod, ['iaiext:navigation', 'iaiext:item']);
    let res = [];
    for (let item of navigation) {
        let name = item.getAttribute('textid');
        res.push(AddHolders(name));
    }
    return res;
}


const GetImg = prod => {
    let img = GetValue(prod, ['icons', 'auction_icon'], 'url');
    if (img == null) {
        img = GetValue(prod, ['images', 'large'], 'url');
    }

    return img;
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

    price = GetValue(prod, ['strikethrough_retail_price'], 'gross');
    if (Number(price) > 0) {
        return AddHolders(price + ' PLN');
    }

    price = GetValue(prod, ['strikethrough_wholesale_price'], 'gross');
    if (Number(price) > 0) {
        return AddHolders(price + ' PLN');
    }

    return '0.00 PLN'
}

const GetAvailable = prod => {
    let sizes = GetElements(prod, ['sizes', 'size'])
    let res = '';
    let list = [];
    if (sizes) {
        for (let i = 0; i < sizes.length; i++) {
            let s = sizes[i];
            let available = s.getAttribute('available');
            if (available && available != 'unavailable') return AddHolders(available.replace('_', ' '))
        }
    }

    return null;
}

const GetSizes = (prod, size_all) => {
    let sizes = GetElements(prod, ['sizes', 'size'])
    let res = '';
    let list = [];
    for (let i = 0; i < sizes.length; i++) {
        let s = sizes[i];
        let name = s.getAttribute('name');
        if (!size_all) {
            let available = s.getAttribute('available') != 'unavailable';
            if (!available) continue;
        }
        list.push(name.replace(',', '.'));
    }

    for (let i = 0; i < list.length; i++) {
        let name = list[i];
        res += name + (i < list.length - 1 ? ', ' : '');
    }

    if (res == '') res = '-';
    return AddHolders(res)
}

const GetWeight = prod => {
    let sizes = GetElements(prod, ['sizes', 'size'])
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

    if (num == 0) {
        for (let i = 0; i < sizes.length; i++) {
            let s = sizes[i];
            let weight = Number(s.getAttribute('weight'));
            if (weight > 0) {
                res = weight.toString() + ' g';
            }
        }
        res = '0 g';
    } else {
        res = (res / num).toString() + ' g';
    }

    return AddHolders(res)
}

const GetCodes = (prod, size_all) => {
    let sizes = GetElements(prod, ['sizes', 'size'])

    let list = [];
    let index = 10;

    for (let i = 0; i < sizes.length; i++) {
        if (index == 1) break;

        let s = sizes[i];
        let code = s.getAttribute('code_producer');

        if (!code) continue;

        if (!size_all) {
            let available = s.getAttribute('available') != 'unavailable';
            if (!available) continue;
        }
        list.push(code);
        index--;
    }

    return list
}


var xmlResult = '';
const AddTooXml = item => {
    xmlResult += `      <item>
        <g:id>` + item.id + `</g:id>
        <title>` + item.title + `</title>
        <description>` + item.description + `</description>\n`;

    if (item.google_product_category) xmlResult += `        <g:google_product_category>` + item.google_product_category + `</g:google_product_category>\n`;

    for (let typ of item.product_type) {
        xmlResult += `        <g:product_type>` + typ + `</g:product_type>\n`
    }

    xmlResult += `        <link>` + item.link + `</link>
        <g:display_ads_link>` + item.display_ads_link + `</g:display_ads_link>\n`;


    if (item.image_link) xmlResult += `        <g:image_link>` + item.image_link + `</g:image_link>\n`

    xmlResult += `        <g:condition>` + item.condition + `</g:condition>
        <g:availability>` + item.availability + `</g:availability>
        <g:price>` + item.price + `</g:price>\n`;

    for (let gtin of item.gtin) {
        xmlResult += `        <g:gtin>` + gtin + `</g:gtin>\n`
    }

    for (let mpn of item.mpn) {
        xmlResult += `        <g:mpn>` + mpn + `</g:mpn>\n`
    }

    xmlResult += `        <g:brand>` + item.brand + `</g:brand>
        <g:size>` + item.size + `</g:size>
        <g:item_group_id>` + item.item_group_id + `</g:item_group_id>
        <g:shipping>
          <g:price>` + item.shipping_price + `</g:price>
        </g:shipping>
        <g:shipping_weight>` + item.shipping_weight + `</g:shipping_weight>
        <adwords_grouping>` + item.adwords_grouping + `</adwords_grouping>
      </item>\n`;
}


const finalize = () => {
    xmlResult = '<?xml version="1.0" encoding="UTF-8"?>\n  <rss xmlns:g="http://base.google.com/ns/1.0" xmlns:iaiext="http://www.iai-shop.com/developers/iof/extensions.phtml" xmlns:functx="http://www.functx.com" version="2.0">\n    <channel>\n';

    let size_all = document.querySelector('#size_all').checked;
    let shipping_price = document.querySelector('#shipping_price').value;
    let condition = document.querySelector('#condition').value;

    let button = document.querySelector('#go');

    let products, num, index, ready, interval;

    let itemsNum = StartTesting();

    setTimeout(() => {
            products = xmlStr.getElementsByTagName("product");
            num = 0;

            index = 0;
            ready = false;

            interval = setInterval(() => {
                    if (index >= products.length) {
                        clearInterval(interval);
                        ready = true;
                        xmlResult += '  </channel>\n</rss>';
                        return;
                    }
                    prod = products[index];
                    index++;

                    let visible = GetValue(prod, ['iaiext:visibility', 'iaiext:site'], 'visible') == 'yes';
                    let availability = GetValue(prod, ['iaiext:availability', 'iaiext:site'], 'value') == 'yes';
                    let availability_size = GetAvailable(prod);

                    if (visible && availability && availability_size) {
                        num++;
                    } else {
                        return;
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
                        gtin: [],
                        mpn: [],
                        brand: AddHolders(GetValue(prod, ['producer'], 'name')),
                        size: GetSizes(prod, size_all),
                        item_group_id: AddHolders(prod.getAttribute('id')),
                        shipping_price: '<![CDATA[' + shipping_price + ']]>',
                        shipping_weight: GetWeight(prod),
                        adwords_grouping: AddHolders(GetValue(prod, ['category'], 'name'))
                    }



                    let code_producer = GetCodes(prod, size_all);
                    let standart_code = prod.getAttribute('producer_code_standard') == 'OTHER';
                    for (let code of code_producer) {
                        if (standart_code) {
                            newItem.mpn.push(AddHolders(code));
                        } else {
                            newItem.gtin.push(AddHolders(code));
                        }
                    }

                    AddTooXml(newItem);
                    CountItems(itemsNum, newItem);
                    button.innerHTML = '' + (index) + ' z ' + products.length;
                }, 0,
                index, data, products, num, size_all, shipping_price, condition, ready, button, xmlResult, itemsNum);
        }, 30,
        xmlResult, size_all, shipping_price, condition, button, products, num, index, ready, interval, itemsNum);

    let intervalEnd = setInterval(() => {
        if (ready) {
            clearInterval(intervalEnd)
            button.innerHTML = 'Dodano ' + num + ' produktow !!!';

            document.querySelector('.save_area').style.display = 'flex';
            document.querySelector('#result').style.display = 'initial';

            document.querySelector('#result').value = xmlResult;

            ShowTest(itemsNum, num)
        } else {

        }
    }, 300, ready, button, xmlResult, itemsNum, num);
}