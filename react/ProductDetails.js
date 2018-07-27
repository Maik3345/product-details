import './global.css'

import { mapObjIndexed, mergeDeepRight } from 'ramda'
import React, { Component } from 'react'
import ContentLoader from 'react-content-loader'
import { FormattedMessage } from 'react-intl'
import { NoSSR } from 'render'
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

class ProductDetails extends Component {
  static defaultProps = {
    price: {
      showListPrice: true,
      showLabels: true,
      showInstallments: true,
      showSavings: true,
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
      },
    }
  }

  static Loader = () => {
    const uniquekey = 'vtex-product-details-loader'

    return (
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <ContentLoader uniquekey={uniquekey} height={600} width={500}>
          <rect x="13" y="171.23" rx="0" ry="0" width="176" height="13.11" />
          <rect x="16.45" y="220.23" rx="0" ry="0" width="40" height="40" />
          <rect x="63.85" y="220.23" rx="0" ry="0" width="40" height="40" />
          <rect x="13" y="195.23" rx="0" ry="0" width="57" height="12" />
          <rect x="13" y="279.63" rx="0" ry="0" width="105.02" height="32.8" />
          <rect
            x="132.85"
            y="333.63"
            rx="0"
            ry="0"
            width="174.72"
            height="30.07"
          />
          <rect x="13" y="341.63" rx="0" ry="0" width="101.26" height="19" />
          <rect x="13" y="395.63" rx="0" ry="0" width="115.2" height="15.96" />
          <circle cx="161.91" cy="402" r="18" />
          <circle cx="207.25" cy="402" r="18" />
          <circle cx="253.38" cy="402" r="18" />
        </ContentLoader>
      </div>
    )
  }

  state = {
    skuIndex: null,
    // Test Code
    name: null,
    skuName: null,
    sellingPrice: null,
    listPrice: null,
  }

  handleSkuChange = skuIndex => {
    this.setState({ skuIndex })
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

  renderLoader() {
    const { displayVertically } = this.props

    return (
      <div className="vtex-product-details flex flex-wrap pa6">
        <div className="vtex-product-details__images-container w-50-ns w-100-s pr5-ns">
          <div className="fr-ns w-100 h-100">
            <div className="flex justify-center">
              <ProductImages.Loader isVertical={displayVertically} />
            </div>
          </div>
        </div>
        <div className="vtex-product-details__details-container w-50-ns w-100-s pl5-ns">
          <div className="fl-ns w-100">
            <ProductDetails.Loader />
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      productQuery: { product, loading },
      displayVertically,
    } = this.props

    const shouldDisplayLoader = !product || loading

    let selectedItem, commertialOffer, sellerId, skuItems, initialItemIndex

    if (!shouldDisplayLoader) {
      const [{ itemId: initialItem }] = product.items

      skuItems = product.items.slice()
      skuItems.sort(this.compareSku)

      initialItemIndex = skuItems.findIndex(item => item.itemId === initialItem)

      selectedItem = skuItems[this.state.skuIndex]
      if (selectedItem == null) {
        selectedItem = skuItems[initialItemIndex]
      }

      [{ commertialOffer }] = selectedItem.sellers
      sellerId = parseInt(selectedItem.sellers[0].sellerId)
    }

    // Test code
    if (!this.state.name) {
      setTimeout(
        () =>
          this.setState({
            name: product.productName,
            skuName: selectedItem.name,
          }),
        2000
      )

      setTimeout(
        () =>
          this.setState({
            listPrice: commertialOffer.ListPrice,
            sellingPrice: commertialOffer.Price,
          }),
        3000
      )
    }

    return (
      <IntlInjector>
        {intl => (
          <NoSSR onSSR={this.renderLoader()}>
            {shouldDisplayLoader ? (
              this.renderLoader()
            ) : (
              <div className="vtex-product-details flex flex-wrap pa6">
                <div className="vtex-product-details__images-container w-50-ns w-100-s pr5-ns">
                  <div className="fr-ns w-100 h-100">
                    <div className="flex justify-center">
                      <ProductImages
                        images={selectedItem.images}
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
                      {/* Test code */}
                      <ProductName
                        name={this.state.name}
                        skuName={this.state.skuName}
                        brandName={product.brand}
                        productReference={product.productReference}
                      />
                    </div>
                    {commertialOffer.AvailableQuantity > 0 && (
                      <div className="vtex-product-details__price-container pt1">
                        <ProductPrice
                          listPrice={this.state.listPrice}
                          sellingPrice={this.state.sellingPrice}
                          installments={commertialOffer.Installments}
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
                      <SKUSelector
                        skuItems={skuItems}
                        defaultIndex={initialItemIndex}
                        onSKUSelected={this.handleSkuChange}
                      />
                    </div>
                    <div className="pv2">
                      <hr className="o-30" size="1" />
                    </div>
                    {commertialOffer.AvailableQuantity > 0 ? (
                      <div>
                        <div className="pv2">
                          <BuyButton
                            skuItems={[
                              {
                                skuId: selectedItem.itemId,
                                quantity: 1,
                                seller: sellerId,
                              },
                            ]}>
                            <FormattedMessage id="button-label" />
                          </BuyButton>
                        </div>
                        <div className="pv4">
                          {/* FIXME: Get this country data correctly */}
                          <ShippingSimulator
                            skuId={selectedItem.itemId}
                            seller={sellerId}
                            country="BRA"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pv4">
                        <AvailabilitySubscriber skuId={selectedItem.itemId} />
                      </div>
                    )}
                    <div className="flex w-100 pv2">
                      <div className="pv2 pr3 f6">
                        <FormattedMessage id="share.label" />:
                      </div>
                      <Share
                        {...this.props.share}
                        title={intl.formatMessage(
                          { id: 'share.title' },
                          {
                            product: product.productName,
                            sku: selectedItem.name,
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
                    specifications={product.properties}
                    skuName={selectedItem.name}
                    description={product.description}
                  />
                </div>
              </div>
            )}
          </NoSSR>
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
