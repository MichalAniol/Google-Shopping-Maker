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
    let description = GetInner(prod, ['short_desc'])
    if (description == null) {
        description = GetInner(prod, ['iaiext:meta_description']);
        if (description == null) {
            description = GetInner(prod, ['description']);
        }
    }

    return description;
}


const Get_google_product_category = prod => {
    let path = GetValue(prod, ['iaiext:iai_category'], 'path');
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
    let img = GetValue(prod, ['iaiext:icons', 'iaiext:auction_icon'], 'url');
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
    if (sizes) {
        for (let i = 0; i < sizes.length; i++) {
            let s = sizes[i];
            let available = s.getAttribute('available');
            if (available != 'unavailable') return AddHolders(available.replace('_', ' '))
        }
    }

    return null;
}

const GetSizes = (prod, size_all) => {
    let sizes = GetElements(prod, ['iaiext:sizes', 'iaiext:size'])
    let res = '';
    let list = [];
    for (let i = 0; i < sizes.length; i++) {
        let s = sizes[i];
        let name = s.getAttribute('size_name');
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


{
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