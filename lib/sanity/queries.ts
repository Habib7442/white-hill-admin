// GROQ for the admin. `_id in path("*")` matches published ids only (drafts
// are `drafts.<id>`, release versions `versions.<release>.<id>`).

const published = `_id in path("*")`
const byOrder = `order(coalesce(order, 99999) asc, lower(coalesce(name, title)) asc)`

export const productListQuery = `
  *[_type == "product" && ${published}] | ${byOrder} {
    _id,
    _updatedAt,
    name,
    mark,
    "slug": slug.current,
    composition,
    description,
    pack,
    dosageForm,
    schedule,
    productType,
    "visible": visible != false,
    order,
    "categoryId": category._ref,
    "packImage": packImage { "assetId": asset._ref, alt },
    "hasDraft": defined(*[_id == "drafts." + ^._id][0]._id)
  }
`

export const productDetailQuery = `
  *[_type == "product" && _id == $id][0] {
    _id,
    _updatedAt,
    name,
    mark,
    "slug": slug.current,
    productType,
    "categoryId": category._ref,
    dosageForm,
    schedule,
    composition,
    unitStatement,
    "ingredients": ingredients[] { _key, ingredient, standard, strength },
    excipients,
    colour,
    description,
    supports,
    directions,
    pack,
    packType,
    storage,
    shelfLife,
    manufacturer { name, address, licenceNo },
    "packImage": packImage { "assetId": asset._ref, alt },
    "gallery": gallery[] { _key, "assetId": asset._ref, alt, caption },
    "leaflet": leaflet { "assetId": asset._ref, "filename": asset->originalFilename },
    "relatedIds": relatedProducts[]._ref,
    order,
    "visible": visible != false,
    seo { title, description },
    "hasDraft": defined(*[_id == "drafts." + $id][0]._id)
  }
`

export const categoryListQuery = `
  *[_type == "category" && ${published}] | ${byOrder} {
    _id,
    title,
    "slug": slug.current,
    order,
    "productCount": count(*[_type == "product" && ${published} && category._ref == ^._id])
  }
`

export const settingsQuery = `
  *[_id == "siteSettings"][0] {
    companyName,
    "logo": logo { "assetId": asset._ref },
    address,
    phone,
    email,
    whatsapp,
    cin,
    gstin,
    drugLicence,
    fssaiLicence
  }
`
