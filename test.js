
const testItems = [
    // google name, list name, sum
    ['g:id', 'id', true],
    ['title', 'title', true],
    ['description', 'description', true],
    ['g:google_product_category', 'google_product_category', false],
    ['g:product_type', 'product_type', false],
    ['link', 'link', true],
    ['g:display_ads_link', 'display_ads_link', true],
    ['g:image_link', 'image_link', false],
    ['g:condition', 'condition', true],
    ['g:availability', 'availability', true],
    ['g:price', 'price', true],
    ['g:gtin', 'gtin', false],
    ['g:mpn', 'mpn', false],
    ['g:brand', 'brand', true],
    ['g:size', 'size', true],
    ['g:item_group_id', 'item_group_id', true],
    ['g:shipping&gt; &lt;g:price', 'shipping_price', true],
    ['g:shipping_weight', 'shipping_weight', true],
    ['adwords_grouping', 'adwords_grouping', true]
];

const StartTesting = () => {
    let res = {}
    for (let item of testItems) {
        res[item[1]] = 0;
    }
    return res;
}

const CountItems = (list, item) => {
    const NullCheck = txt => txt.indexOf('null') == -1;

    if (NullCheck(item.id)) list.id++;
    if (NullCheck(item.title)) list.title++;
    if (NullCheck(item.description)) list.description++;
    if (item.google_product_category) list.google_product_category++;
    list.product_type += item.product_type.length;
    if (NullCheck(item.link)) list.link++;
    if (NullCheck(item.display_ads_link)) list.display_ads_link++;
    if (item.image_link) list.image_link++;
    if (NullCheck(item.condition)) list.condition++;
    if (NullCheck(item.availability)) list.availability++;
    if (NullCheck(item.price)) list.price++;
    if (item.gtin) list.gtin++;
    if (item.mpn) list.mpn++;
    if (NullCheck(item.brand)) list.brand++;
    if (NullCheck(item.size)) list.size++;
    if (NullCheck(item.item_group_id)) list.item_group_id++;
    if (NullCheck(item.shipping_price)) list.shipping_price++;
    if (NullCheck(item.shipping_weight)) list.shipping_weight++;
    if (NullCheck(item.adwords_grouping)) list.adwords_grouping++;
}



const ShowTest = (list, allNum = 0) => {
    let popup_wrap = document.querySelector('.popup_wrap');
    popup_wrap.style.display = 'initial';

    let values = document.querySelector('.values');
    values.querySelector('table').remove();

    const AddNode = (parent, typ, inner = null, clip = false, clas = null) => {
        let node = document.createElement(typ);
        if (inner) {
            if (clip) {
                node.innerHTML = '&lt;' + inner + '&gt;';
            } else {
                node.innerHTML = inner;
            }
        }
        if (clas) node.className = clas;
        parent.appendChild(node);

        return node;
    }

    const AddTestValue = (name, num, state) => {
        let tr = AddNode(nodeTab, 'tr');
        AddNode(tr, 'td', name, true, 'blackText');
        AddNode(tr, 'td', num);
        AddNode(tr, 'td', state ? 'OK' : 'error!!!', false, state ? 'blackText' : 'blackText error');
    }

    let nodeTab = AddNode(values, 'table');
    AddNode(nodeTab, 'col');
    AddNode(nodeTab, 'col');
    AddNode(nodeTab, 'col');

    let tr = AddNode(nodeTab, 'tr');
    AddNode(tr, 'th', 'nazwa', false, 'blackText');
    AddNode(tr, 'th', 'ilość');
    AddNode(tr, 'th', 'status', false, 'blackText');


    const GetSummStatus = () => {
        let index = 0;
        let sum = 0;
        let res = false;
        for (let item of testItems) {
            if (item[2] == false) continue;
            sum += list[item[1]];
            index++;
        }
        if (sum / index == allNum) res = true;
        return res;
    }

    let sum = GetSummStatus();

    AddTestValue('item', allNum, true)

    for (let item of testItems) {
        let num = list[item[1]];
        let state = item[2] ? sum : num > 0;

        AddTestValue(item[0], num.toString(), state)
    }
}

// ShowTest(StartTesting())

const CloseTestWindow = () => {
    let popup_wrap = document.querySelector('.popup_wrap');
    popup_wrap.style.display = 'none';
    console.log('%c popup_wrap:', 'background: #ffcc00; color: #003300', popup_wrap)
}