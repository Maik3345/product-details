import './global.css'

import { mapObjIndexed, mergeDeepRight, path } from 'ramda'
import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import {
  AvailabilitySubscriber,
  BuyButton,
  ProductDescription,
  ProductImages,
  ProductName,
  ProductPrice,
  Share,
  ShippingSimulator,
  SKUSelector,
} from 'vtex.store-components'

import IntlInjector from './components/IntlInjector'
import ProductDetailsPropTypes from './propTypes'

const { account } = global.__RUNTIME__
const productNameLoaderStyles = {
  'vtex-product-name__brand--loader': {
    x: 0,
    width: '100%',
    height: '1.631em',
  },
  'vtex-product-name__sku--loader': {
    x: 0,
    y: '2.569em',
    width: '10.311em',
    height: '1.045em',
  },
}
const productPriceLoaderStyles = {
  'vtex-price-list__container--loader': {
    x: 0,
    width: '7.219em',
    height: '0.56em',
  },
  'vtex-price-selling__label--loader': {
    x: 0,
    y: '2em',
    width: '2.85em',
    height: '1.08em',
  },
  'vtex-price-selling--loader': {
    x: '3.25em',
    y: '0.86em',
    width: '14.572em',
    height: '2.176em',
  },
  'vtex-price-installments--loader': {
    x: 0,
    y: '3.75em',
    width: '12em',
    height: '0.825em',
  },
  'vtex-price-savings--loader': {
    x: 0,
    y: '5em',
    width: '10em',
    height: '0.686em',
  },
}

class ProductDetails extends Component {
  static defaultProps = {
    price: {
      showListPrice: true,
      showLabels: true,
      showInstallments: true,
      showSavings: true,
    },
    name: {
      showProductReference: false,
      showBrandName: false,
      showSku: false,
    },
    displayVertically: false,
  }

  static propTypes = ProductDetailsPropTypes

  static getSchema = props => {
    const shareSchema = Share.schema || Share.getSchema(props)
    const priceSchema = mergeSchemaAndDefaultProps(
      ProductPrice.schema || ProductPrice.getSchema(props),
      'price'
    )
    const nameSchema = ProductName.schema || ProductName.getSchema(props)

    return {
      title: 'editor.product-details.title',
      description: 'editor.product-details.description',
      type: 'object',
      properties: {
        displayVertically: {
          title: 'editor.product-details.displayVertically.title',
          type: 'boolean',
          default: false,
          isLayout: true,
        },
        share: shareSchema,
        price: priceSchema,
        name: nameSchema,
      },
    }
  }

  compareSku = (item, otherItem) => {
    const [
      {
        commertialOffer: { AvailableQuantity: quantity, Price: price },
      },
    ] = item.sellers
    const [
      {
        commertialOffer: {
          AvailableQuantity: otherQuantity,
          Price: otherPrice,
        },
      },
    ] = otherItem.sellers

    return quantity === 0
      ? 1
      : (otherQuantity === 0 && -1) || price - otherPrice
  }

  get skuItems() {
    const items = path(['productQuery', 'product', 'items'], this.props) || []
    const skuItems = items.slice()
    skuItems.sort(this.compareSku)
    return skuItems
  }

  get selectedItem() {
    const items = path(['productQuery', 'product', 'items'], this.props) || []
    if (!this.props.query.skuId) return items[0]
    const [selected] = items.filter(sku => sku.itemId == this.props.query.skuId)
    return selected
  }

  get commertialOffer() {
    return path(['sellers', 0, 'commertialOffer'], this.selectedItem)
  }

  get sellerId() {
    return parseInt(path(['sellers', 0, 'sellerId'], this.selectedItem))
  }

  render() {
    const {
      productQuery: { product },
      displayVertically,
    } = this.props

    const showBuyButton =
      Number.isNaN(+path(['AvailableQuantity'], this.commertialOffer)) || // Show the BuyButton loading information
      path(['AvailableQuantity'], this.commertialOffer) > 0

    return (
      <IntlInjector>
        {intl => (
          <div className="vtex-product-details vtex-page-padding flex flex-wrap pa6">
            <div className="vtex-product-details__images-container w-50-ns w-100-s pr5-ns">
              <div className="fr-ns w-100 h-100">
                <div className="flex justify-center pt2">
                  <ProductImages
                    images={path(['images'], this.selectedItem)}
                    thumbnailSliderOrientation={
                      displayVertically ? 'VERTICAL' : 'HORIZONTAL'
                    }
                  />
                </div>
              </div>
            </div>
            <div className="vtex-product-details__details-container w-50-ns w-100-s pl5-ns">
              <div className="fl-ns w-100">
                <div className="vtex-product-details__name-container pv2">
                  <ProductName
                    styles={productNameLoaderStyles}
                    name={path(['productName'], product)}
                    skuName={path(['name'], this.selectedItem)}
                    brandName={path(['brand'], product)}
                    productReference={path(['productReference'], product)}
                    {...this.props.name}
                  />
                </div>
                {(Number.isNaN(
                  +path(['AvailableQuantity'], this.commertialOffer)
                ) ||
                  path(['AvailableQuantity'], this.commertialOffer) > 0) && (
                  <div className="vtex-product-details__price-container pt1">
                    <ProductPrice
                      styles={productPriceLoaderStyles}
                      listPrice={path(['ListPrice'], this.commertialOffer)}
                      sellingPrice={path(['Price'], this.commertialOffer)}
                      installments={path(
                        ['Installments'],
                        this.commertialOffer
                      )}
                      {...this.props.price}
                    />
                  </div>
                )}
                <div className="pv2">
                  <hr className="o-30" size="1" />
                </div>
                <div>
                  <div className="f7">
                    <FormattedMessage id="sku-label" />
                  </div>
                  {product && (
                    <SKUSelector
                      skuItems={this.skuItems}
                      skuSelected={this.selectedItem}
                      productSlug={product.linkText}
                    />
                  )}
                </div>
                <div className="pv2">
                  <hr className="o-30" size="1" />
                </div>
                {showBuyButton ? (
                  <Fragment>
                    <div className="pv2">
                      <BuyButton
                        skuItems={
                          this.selectedItem &&
                          this.sellerId && [
                            {
                              skuId: this.selectedItem.itemId,
                              quantity: 1,
                              seller: this.sellerId,
                            },
                          ]
                        }>
                        <FormattedMessage id="button-label" />
                      </BuyButton>
                    </div>
                    <div className="pv4">
                      {/* FIXME: Get this country data correctly */}
                      <ShippingSimulator
                        skuId={path(['itemId'], this.selectedItem)}
                        seller={this.sellerId}
                        country="BRA"
                      />
                    </div>
                  </Fragment>
                ) : (
                  <div className="pv4">
                    <AvailabilitySubscriber skuId={this.selectedItem.itemId} />
                  </div>
                )}
                <div className="flex w-100 pv2">
                  <div className="pv2 pr3 f6">
                    <FormattedMessage id="share.label" />:
                  </div>
                  <Share
                    {...this.props.share}
                    loading={!path(['name'], this.selectedItem)}
                    title={intl.formatMessage(
                      { id: 'share.title' },
                      {
                        product: path(['productName'], product),
                        sku: path(['name'], this.selectedItem),
                        store: account,
                      }
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="pv4 w-100">
              <hr className="b--black-10" size="0" />
            </div>
            <div className="vtex-product-details__description-container pv2 w-100 h-100">
              <ProductDescription
                specifications={path(['properties'], product)}
                skuName={path(['name'], this.selectedItem)}
                description={path(['description'], product)}
              />
            </div>
          </div>
        )}
      </IntlInjector>
    )
  }
}

function mergeSchemaAndDefaultProps(schema, propName) {
  return mergeDeepRight(schema, {
    properties: {
      ...mapObjIndexed(
        value => ({ default: value }),
        ProductDetails.defaultProps[propName]
      ),
    },
  })
}

export default ProductDetails
