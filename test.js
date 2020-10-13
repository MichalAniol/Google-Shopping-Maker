const StartTesting = () => {
    return {
        id: 0,
        title: 0,
        description: 0,
        google_product_category: 0,
        product_type: 0,
        link: 0,
        display_ads_link: 0,
        image_link: 0,
        condition: 0,
        availability: 0,
        price: 0,
        gtin: 0,
        mpn: 0,
        brand: 0,
        size: 0,
        item_group_id: 0,
        shipping_price: 0,
        shipping_weight: 0,
        adwords_grouping: 0
    }
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

const ShowTest = list => {
    console.log('%c list:', 'background: #ffcc00; color: #003300', list)

}