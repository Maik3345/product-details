import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { compose, graphql, withApollo } from 'react-apollo'

import BuyButton from 'vtex.storecomponents/BuyButton'
import ProductDescription from 'vtex.storecomponents/ProductDescription'
import ProductName from 'vtex.storecomponents/ProductName'
import Price from 'vtex.storecomponents/ProductPrice'
import ProductImages from 'vtex.storecomponents/ProductImages'
import ShippingSimulator from 'vtex.storecomponents/ShippingSimulator'

import Spinner from '@vtex/styleguide/lib/Spinner'

import productQuery from './graphql/productQuery.gql'
import cachedFragment from './graphql/fragmentProduct.gql'

import './global.css'

class ProductDetails extends Component {
  render() {
    // TODO: change cacheId to retrieve this from a separate procedure
    const cachedId = `vtex_storegraphql_2_4_1_Product:${this.props.variables.id}`
    const cachedProductQuery = this.props.client.readFragment({
      id: cachedId,
      fragment: cachedFragment
    })
    const { product } = (this.props.data.loading ?
                         {product: cachedProductQuery} :
                         this.props.data)
    console.log("Product: ", product)
    if (!product) {
      return (
        <div className="pt6 tc">
          <Spinner />
        </div>
      )
    }

    const selectedItem = product.items[0]
    const { commertialOffer } = selectedItem.sellers[0]

    return (
      <div className="vtex-product-details flex flex-wrap pa6">
        <div className="vtex-product-details__images-container w-50-ns w-100-s pr5-ns">
          <div className="fr-ns w-100 h-100">
            <div className="flex justify-center">
              <ProductImages
                images={selectedItem.images}
                thumbnailSliderOrientation="HORIZONTAL"
              />
            </div>
          </div>
        </div>
        <div className="vtex-product-details__details-container w-50-ns w-100-s pl5-ns">
          <div className="fl-ns w-100">
            <div className="vtex-product-details__name-container pv2">
              <ProductName
                name={product.productName}
                skuName={selectedItem.name}
                brandName={product.brand}
              />
            </div>
            <div className="vtex-product-details__price-container pt4">
              <Price
                listPrice={commertialOffer.ListPrice}
                sellingPrice={commertialOffer.Price}
                installments={commertialOffer.Installments}
                installmentPrice={commertialOffer.InstallmentPrice}
                showListPrice
                showLabels
                showInstallments
                showSavings
              />
            </div>
            <div className="pv2">
              <hr className="b--black-10" size="0" />
            </div>
            <div className="pv2">
              <ShippingSimulator />
            </div>
            <div className="pv2">
              {/* TODO: Implement something after click and use real Seller and SalesChannel*/}
              <BuyButton
                seller={parseInt(selectedItem.sellers[0].sellerId)}
                skuId={selectedItem.itemId}
                afterClick={() => null}>
                <FormattedMessage id="button-label" />
              </BuyButton>
            </div>
          </div>
        </div>
        <div className="pv4 w-100">
          <hr className="b--black-10" size="0" />
        </div>
        <div className="vtex-product-details__description-container pv2 w-100 h-100">
          <ProductDescription>
            <span className="measure-wide">{product.description}</span>
          </ProductDescription>
        </div>
      </div>
    )
  }

  static propTypes = {
    /** variables for GraphQL query */
    variables: PropTypes.shape({
      /** id for GraphQL query **/
      id: PropTypes.string.isRequired
    }).isRequired,
    /** Product that owns the informations */
    data: PropTypes.shape({
      product: PropTypes.shape({
        /** Global id */
        id: PropTypes.string.isRequired,
        /** Product's id */
        productId: PropTypes.string.isRequired,
        /** Product's name */
        productName: PropTypes.string.isRequired,
        /** Product's brand */
        brand: PropTypes.string.isRequired,
        /** Product's SKUs */
        items: PropTypes.arrayOf(
          PropTypes.shape({
            /** SKU id */
            itemId: PropTypes.string.isRequired,
            /** SKU name */
            name: PropTypes.string.isRequired,
            /** SKU Images to be shown */
            images: PropTypes.arrayOf(
              PropTypes.shape({
                /** Image id */
                imageId: PropTypes.string.isRequired,
                /** Image label */
                imageLabel: PropTypes.string,
                /** Image tag as string */
                imageTag: PropTypes.string,
                /** Image URL */
                imageUrl: PropTypes.string.isRequired,
                /** Image text */
                imageText: PropTypes.string.isRequired,
              })
            ).isRequired,
            /** SKU sellers */
            sellers: PropTypes.arrayOf(
              PropTypes.shape({
                /** Seller id */
                sellerId: PropTypes.string.isRequired,
                /** Seller comertial offer */
                commertialOffer: PropTypes.shape({
                  /** Selling Price */
                  Price: PropTypes.number.isRequired,
                  /** List Price */
                  ListPrice: PropTypes.number.isRequired,
                }).isRequired,
              })
            ).isRequired,
          })
        ).isRequired,
      }),
    }),
    /** intl property to format data */
    intl: intlShape.isRequired,
  }
}

const options = {
  options: ({ variables }) => ({ variables })
}

export default compose(
  withApollo,
  graphql(productQuery, options)
)(injectIntl(ProductDetails))
