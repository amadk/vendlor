import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Segment, Table, Button, Message, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import { forEachAsync } from 'forEachAsync';
import Address from './Address.jsx';
import AddressForm from './AddressForm.jsx';
import Payment from './Payment.jsx';


class Cart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartRequestComplete: false,
      products: [],
      selectedPaymentId: 'Cash on delivery',
      addressForm: false,
      addressToEdit: {},
      loading: false
    }
  }

  componentDidMount () {
    this.getCartProducts();
  }

  getCartProducts () {
    var self = this;
    axios.get('/api/cart')
    .then(response => {
      var products = response.data
      self.setState({
        products: products,
        cartRequestComplete: true
      })

      if (products.length > 0) {
        var shipping = 12;
        var subtotal = 0;
        var totalShipping = 0;
        var shipments = [];

        products.forEach(product => {
          subtotal+=(product.cart.quantity*product.price);
          var shipment = shipments.filter(shipment => shipment.pickupAddressId === product.pickupAddressId)[0]
          if (shipment) {
            shipment.products.push(product)
          } else {
            shipments.push({
              pickupAddressId: product.pickupAddressId,
              products: [product]
            });
          }
        })

        shipments.forEach(shipment => {
          totalShipping += getShippingCost(shipment)
        })

        var grandTotal = subtotal+totalShipping;
        self.setState({
          shipping: shipping,
          subtotal: subtotal,
          totalShipping: totalShipping,
          grandTotal: grandTotal
        })
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  handleQuantityChange (e, { name, value }) {
    var self = this;
    axios.put('/api/cart/'+name, {
      quantity: value
    })
    .then(response => {
      self.getCartProducts();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  removeFromCart (e, { value }) {
    var self = this;
    axios.delete('/api/cart/'+value)
    .then(response => {
      self.getCartProducts();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  createOrder () {
    const { selectedPaymentId, products, subtotal, totalShipping, grandTotal } = this.state;

    if (products.length > 0 && this.checkFields()) {
      this.setState({loading: true})
      var pickupAddressIds = [];
      products.forEach(product => {
        if (pickupAddressIds.indexOf(product.pickupAddressId) === -1) {
          pickupAddressIds.push(product.pickupAddressId)
        }
      })

      var shipments = [];
      pickupAddressIds.forEach(pickupAddressId => {
        var shipmentProducts = products.filter(product => product.pickupAddressId === pickupAddressId)
        var allProducts = []
        shipmentProducts.forEach(product => {
          for (var i = 1; i <= product.cart.quantity; i++) {
            allProducts.push(product)
          }
        })
        var subShipments = [{
          weight: 0,
          pickupAddressId: pickupAddressId,
          products: []
        }];
        allProducts.forEach(product => {
          subShipments.forEach(shipment => { 
            if (shipment.weight+product.weight <= 30000) {
              shipment.products.push(product)
              shipment.weight += product.weight
            } else {
              subShipments.push({
                weight: product.weight,
                pickupAddressId: pickupAddressId,
                products: [product]
              })
            }
          })
        })
        shipments = shipments.concat(subShipments);
      })

      var self = this;
      axios.post('/api/orders', {
        paymentMethod: selectedPaymentId,
        subtotal: subtotal,
        shippingTotal: totalShipping,
        grandTotal: grandTotal,
      })
      .then(function (response) {
        var orderId = response.data.id
        // self.createCharge(orderId, () => {
          forEachAsync(shipments, (next1, shipment, index) => {
            self.createShipment(orderId, shipment, shipmentResponse => {
              forEachAsync(shipment.products, (next2, product, index) => {
                self.createOrderedProduct(orderId, shipmentResponse.data.id, product, next2)
              }).then(next1)
            })
          }).then(() => {
            // self.getCartProducts()
            self.setState({loading: false})
            self.props.history.push('/track')
          })
        // })
      })
      .catch(function (error) {
        console.log(error);
      });      
    }
  }

  createCharge (orderId, callback) {
    const { selectedPaymentId, grandTotal } = this.state;

    var self = this;
    axios.post('/api/orders/'+orderId+'/charges', {
      amount: grandTotal,
      source: selectedPaymentId,
      currency: 'AED',
      transactionFee: 0,
      status: '0% complete'
    })
    .then(function (response) {
      callback();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  createShipment (orderId, shipment, callback) {

    const { selectedAddressId, selectedPaymentId, products, shipping } = this.state;

    var amountToCollect = 0;

    shipment.products.forEach(product => {
      amountToCollect += product.price
    })
    amountToCollect += getShipmentCost(shipment)

    var self = this;
    axios.post('/api/orders/'+orderId+'/shipments', {
      pickupAddressId: shipment.pickupAddressId,
      weight: shipment.weight,
      deliveryAddressId: selectedAddressId,
      type: 'order',
      speed: 'Next day',
      shipper: 'Wing',
      amountToCollect: amountToCollect
    })
    .then(function (response) {
      callback(response)
    })
    .catch(function (error) {
      console.log(error);
    }); 
  }

  createOrderedProduct (orderId, shipmentId, product, callback) {
    var self = this;
    axios.post('/api/orders/'+orderId+'/shipments/'+shipmentId+'/products', {
      title: product.title,
      price: product.price,
      product_id: product.id,
      seller_id: product.account_id,
      comission: 10,
      condition: product.condition,
      sellerRevenue: product.price*0.9,
      platformRevenue: product.price*0.1,
      status: 'ordered'
    })
    .then(function (response) {
      callback();
    })
    .catch(function (error) {
      console.log(error);
    }); 
  }

  checkFields () {
    var self = this
    var checkPass = true;

    if (!this.state.selectedAddressId) {
      checkPass = false;
      this.setState({
        addressError: true,
        addressErrorMessage: 'Please select an address'
      })
    } else {
      this.setState({
        addressError: false,
        addressErrorMessage: ''
      })
    }

    return checkPass
  }

  openAddressForm (address) { 
    this.setState({ 
      addressToEdit: address || {},
      addressForm: true 
    }) 
  }

  closeAddressForm () { this.setState({ addressForm: false }) }



  render() {
    const { loading, addressError, addressErrorMessage, addressForm, addressToEdit, cartRequestComplete, products, selectedAddressId, selectedPaymentId, shipping, subtotal, totalShipping, grandTotal } = this.state

    if (!cartRequestComplete) {
      return (
        <div>
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        </div>
      )
    } else {
      if (products.length === 0) {
        return (
          <Segment textAlign='center' padded='very'>
            <Header as='h1'>Your cart is empty</Header>
          </Segment>
        )
      } else {
        
        if (addressForm) { return (<AddressForm addressToEdit={addressToEdit} closeAddressForm={this.closeAddressForm.bind(this)} />) }

        return (
          <div>
            <Grid>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                {parser(products).map((seller, index1) => (
                  <div key={index1} style={{margin: '15px 0px'}}>
                    <Segment>
                      <Label attached='top'>Seller: {seller.seller}</Label>
                      {seller.addresses.map((address, index2) => (
                        <div key={index2}>
                          {address.products.map((product, index3) => {
                            var quantityArr = [];
                            for (var i = 1; i < product.quantity+1; i++) {
                              quantityArr.push({ key: i, text: i, value: i })
                            }
                            return (
                            <Grid key={index3}>
                              <Grid.Column mobile={16} tablet={3} computer={3}>
                                <Image src={'https://s3.ap-south-1.amazonaws.com/vendlor/'+product.primaryPhoto} size='large' />
                              </Grid.Column>
                              <Grid.Column mobile={16} tablet={5} computer={5}>
                                <Header as='h3'>
                                  <Link to={'/products/'+product.id}>{product.title}</Link>
                                  <Header.Subheader>Condition: {product.condition}</Header.Subheader>
                                  <Header.Subheader>Category: {product.category}</Header.Subheader>
                                  <Header.Subheader>Age: {product.age}</Header.Subheader>
                                  <Header.Subheader>Warranty: {product.warranty}</Header.Subheader>
                                </Header>
                              </Grid.Column>
                              <Grid.Column mobile={8} tablet={5} computer={5} style={{paddingTop: 5}}>
                                Quantity: <Dropdown
                                  onChange={this.handleQuantityChange.bind(this)}
                                  options={quantityArr}
                                  placeholder='Choose an option'
                                  selection
                                  compact
                                  search
                                  name={product.id}
                                  value={product.cart.quantity}
                                />
                              </Grid.Column>
                              <Grid.Column mobile={8} tablet={3} computer={3} textAlign='right'>
                                <Header as='h3' value={product.id}>
                                  {(this.state['quantityInput'+product.id] ? this.state['quantityInput'+product.id] : product.cart.quantity)*product.price} AED
                                  <Button basic compact value={product.id} onClick={this.removeFromCart.bind(this)} style={{boxShadow: 'none'}}><Icon fitted name='trash'/>Remove</Button>
                                </Header>
                              </Grid.Column>
                            </Grid>
                          )})}
                          <Menu borderless>
                            <Menu.Item style={{overflowWrap: 'break-word', width: '50%'}}>{getNumberOfShipments(address)} Shipments - Next day shipping (1-3 business days)</Menu.Item>

                            <Menu.Menu position='right'>
                              <Menu.Item><Header as='h4'>+ {getShippingCost(address)} AED</Header></Menu.Item>
                            </Menu.Menu>
                          </Menu>
                          {index2 !== seller.addresses.length-1 ? <Divider/> : <div></div>}
                        </div>
                      ))}
                    </Segment>
                  </div>
                ))}
               
                <Payment selectedPaymentId={selectedPaymentId} selectPaymentId={((value) => { this.setState({ selectedPaymentId: value }); }).bind(this)} />
                <Divider hidden />
                <Message
                  visible={addressError}
                  hidden={!addressError}
                  attached
                  error
                  content={addressErrorMessage}
                />
                <Address selection selectedAddressId={selectedAddressId} openAddressForm={this.openAddressForm.bind(this)} selectAddressId={((value) => { this.setState({ selectedAddressId: value }); }).bind(this)} />

              </Grid.Column>

              <Grid.Column mobile={16} tablet={16} computer={4} style={{margin: '15px 0px'}}>
                <Segment padded style={{position: 'sticky', top: '75px'}}>
                  <Grid columns={2}>
                    <Grid.Column>
                      <Header as='h5'>Subtotal:</Header>
                    </Grid.Column>
                    <Grid.Column textAlign='right'>
                      <Header as='h5'>{subtotal} AED</Header>
                    </Grid.Column>
                  </Grid>

                  <Grid columns={2}>
                    <Grid.Column>
                      <Header as='h5'>Shipping:</Header>
                    </Grid.Column>
                    <Grid.Column textAlign='right'>
                      <Header as='h5'>{totalShipping} AED</Header>
                    </Grid.Column>
                  </Grid>

                  <Divider/>

                  <Grid columns={2}>
                    <Grid.Column>
                      <Header as='h5'>Total:</Header>
                    </Grid.Column>
                    <Grid.Column textAlign='right'>
                      <Header as='h5'>{grandTotal} AED</Header>
                    </Grid.Column>
                  </Grid>

                  <Divider/>

                  <Button as={Link} to='/' fluid basic color='blue'>Continue shopping</Button> 
                  <Button primary fluid onClick={this.createOrder.bind(this)} style={{marginTop: 10}}>Confirm and Pay</Button> 

                </Segment>
              </Grid.Column>
            </Grid>
            <Dimmer inverted active={loading}>
              <Loader />
            </Dimmer>
          </div>
        );   
      }
    }
  }
}


export default withRouter(Cart)



var shipmentOptions = [
  {weight: 2, price: 16},
  {weight: 5, price: 17},
  {weight: 10, price: 27},
  {weight: 30, price: 59},
]

var getNumberOfShipments = address => {
  var totalWeight = 0;

  address.products.forEach(product => {
    totalWeight += (product.weight*product.cart.quantity);
  })
  return Math.ceil(totalWeight/30000);
}

var getShippingCost = address => {
  var totalWeight = 0;

  address.products.forEach(product => {
    totalWeight += (product.weight*product.cart.quantity);
  })
  var index = totalWeight/30000;
  var heavyShipmentsCost = Math.floor(index) * 59;
  var lightShipmentWeight = Math.ceil((index - Math.floor(index))*30000)

  var lightShipmentCost;
  if (lightShipmentWeight > 0) {
    shipmentOptions.some((shipmentOption, index) => {
      if (lightShipmentWeight <= (shipmentOption.weight*1000)) {
        lightShipmentCost = shipmentOption.price;
        return true;
      }
    })    
  } else {
    lightShipmentCost = 0
  }
  return lightShipmentCost + heavyShipmentsCost;
}

var getShipmentCost = address => {
  var totalWeight = 0;

  address.products.forEach(product => {
    totalWeight += product.weight;
  })
  var result;
  shipmentOptions.some((shipmentOption, index) => {
    if (totalWeight <= (shipmentOption.weight*1000)) {
      result = shipmentOption.price;
      return true;
    }
  })
  return result
}


var getTotalShipping = seller => {
  var totalShipping = 0;
  seller.addresses.forEach(address => {
    totalShipping += getShippingCost(address)
  })
  return totalShipping;
}

var parser = (products) => {
  var sellers = [];
  products.forEach(product => {
    var sellerFound = sellers.filter(seller=>seller.seller===product.account_id)[0];
    if (sellerFound) {
      var addressFound = sellerFound.addresses.filter(address=>address.address===product.pickupAddressId)[0];
      if (addressFound) {
        var productFound = addressFound.products.filter(addressProduct=>addressProduct.id===product.id)[0];
        if (!productFound) {
          addressFound.products.push(product)
        }
      } else {
        sellerFound.addresses.push({
          address: product.pickupAddressId,
          products: [product]
        })
      }
    } else {
      sellers.push({
        seller: product.account_id,
        addresses:[{
          address: product.pickupAddressId,
          products: [product] 
        }]
      })
    }
  })
  return sellers
}
