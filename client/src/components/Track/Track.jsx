import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, TextArea, Accordion, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import forEachAsync from 'forEachAsync';
import moment from 'moment-timezone';

export default class Track extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trackRequestComplete: false,
      orders: [],
      cancelOrderModal: false,
      cancelReturnModal: false,
      productInCancelModal: {}
    }
  }

  componentDidMount () {
    this.getOrders();
  }

  getOrders (callback) {
    var self = this;
    axios.get('/api/orders')
    .then(response => {
      self.setState({
        orders: response.data,
        trackRequestComplete: true
      })
      if (callback) { callback() }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  toggleReturnCart (e, { product, shipment, order }) {
    var self = this
    axios.post('/api/orders/'+order.id+'/shipments/'+shipment.id+'/products/'+product.id, {
      returnCart: !product.returnCart
    })
    .then(response => {
      self.getOrders();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  openOrderCancelModal (e, { self, order, shipment, product }) { 
    self.setState({
      orderInCancelModal: order,
      shipmentInCancelModal: shipment,
      productInCancelModal: product,
      cancelOrderModal: true
    })
  }

  closeOrderCancelModal () {
    this.setState({
      orderInCancelModal: {},
      shipmentInCancelModal: {},
      productInCancelModal: {},
      cancelOrderModal: false,
    })
  }

  openReturnCancelModal (e, { self, order, shipment, product }) { 
    self.setState({
      orderInCancelModal: order,
      shipmentInCancelModal: shipment,
      productInCancelModal: product,
      cancelReturnModal: true
    })
  }

  closeReturnCancelModal () {
    this.setState({
      orderInCancelModal: {},
      shipmentInCancelModal: {},
      productInCancelModal: {},
      cancelReturnModal: false,
    })
  }

  checkFields (productId) {
    var self = this
    var checkPass = true;

    if (!this.state['reason-'+productId]) {
      checkPass = false;
      this.setState({
        ['cancelReasonError-'+productId]: true,
        ['cancelReasonErrorMessage-'+productId]: 'Please select a return reason'
      })
    } else {
      this.setState({
        ['cancelReasonError-'+productId]: false,
        ['cancelReasonErrorMessage-'+productId]: ''
      })
    }

    return checkPass
  }

  cancelProduct () {
    var self = this;
    const { orderInCancelModal, shipmentInCancelModal, productInCancelModal } = this.state;
    var order = orderInCancelModal;
    var shipment = shipmentInCancelModal;
    var product = productInCancelModal;

    if (product.status === 'ordered' && shipment.status === 'order_received' && this.checkFields(product.id)) {
      axios.post('/api/orders/'+order.id+'/shipments/'+shipment.id+'/products/'+product.id, {
        status: 'order_cancelled',
        returnReason: self.state['reason-'+product.id],
        returnDetails: self.state['description-'+product.id]
      })
      .then(response => {
        self.getOrders(() => {
          if (shipment.orderedProducts.filter(product=>(product.status === 'order_cancelled')).length === shipment.orderedProducts.length) {
            self.cancelShipment();
          } else {
            self.closeOrderCancelModal();        
          }
        })
      })
      .catch(function (error) {
        console.log(error);
      });
    } else if (product.status === 'returned' && shipment.status === 'order_received') {
      axios.post('/api/orders/'+order.id+'/shipments/'+shipment.id+'/products/'+product.id, {
        status: 'return_cancelled',
        returnReason: null,
        returnDetails: null
      })
      .then(response => {
        self.getOrders(() => {
          if (shipment.orderedProducts.filter(product=>(product.status === 'Order Cancelled')).length+1 === shipment.orderedProducts.length) {
            self.cancelShipment();
          } else {
            self.closeReturnCancelModal();        
          }
        })
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  cancelShipment () {
    var self = this;
    const { cancelOrderModal, orderInCancelModal, shipmentInCancelModal, productInCancelModal } = this.state;


    axios.post('/api/orders/'+orderInCancelModal.id+'/shipments/'+shipmentInCancelModal.id, {
      status: 'cancelled',
    })
    .then(response => {
      self.getOrders();
      cancelOrderModal ? self.closeOrderCancelModal() : self.closeReturnCancelModal()
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }


  render() {
    var self = this;
    const { trackRequestComplete, orders, cancelOrderModal, cancelReturnModal, productInCancelModal } = this.state;

    var Returnbutton = ({ order, shipment, product}) => {
      var checkReturnWindow = (moment().tz('UTC').valueOf() - moment(shipment.deliveredDate).valueOf()) < returnPeriod;
      if (shipment.status === 'order_received' && product.status === 'ordered') {
        return (<Button self={self} order={order} shipment={shipment} product={product} onClick={this.openOrderCancelModal.bind(this)}>Cancel Order</Button>)
      } else if (shipment.status === 'order_received' && product.status === 'returned') {
        return (<Button self={self} order={order} shipment={shipment} product={product} onClick={this.openReturnCancelModal.bind(this)}>Cancel Return</Button>)
      } else if (checkReturnWindow && shipment.status === 'delivered' && !product.returnCart && (product.status === 'ordered' || product.status === 'return_cancelled')) {
        return (<Button order={order} shipment={shipment} product={product} onClick={this.toggleReturnCart.bind(this)}>Add to return cart</Button>)
      } else if (checkReturnWindow && shipment.status === 'delivered' && product.returnCart) {
        return (<Button order={order} shipment={shipment} product={product} onClick={this.toggleReturnCart.bind(this)}>Remove from return cart</Button>)
      } else {
        return (<div></div>)
      }
    }


    if (!trackRequestComplete) {
      return (
        <div>
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        </div>
      )
    } else {
      if (orders.length === 0) {
        return (
          <Segment textAlign='center' padded='very'>
            <Header as='h1'>Your don't have any past orders</Header>
          </Segment>
        )
      } else {
        return (
          <div>
            <Menu secondary stackable>
              <Menu.Item><Header as='h2'>Track Your Orders</Header></Menu.Item>
              <Menu.Menu position='right'>
                <Menu.Item><Button primary as={Link} to='/return'>Return Cart</Button></Menu.Item>
              </Menu.Menu>
            </Menu>
            <Grid>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                {orders.map((order, index1) => (
                  <div key={index1} style={{margin: '15px 0px'}}>
                    <Segment>
                      <Grid>
                        <Grid.Column mobile={16} tablet={5} computer={5}>
                          Order placed on: {moment(order.createdAt).format('Do MMMM YYYY, h:mm:ss a')}<br/>
                          Order ID: {order.id}<br/>
                        </Grid.Column>
                        <Grid.Column mobile={16} tablet={5} computer={5}>
                          Payment method: {order.paymentMethod}<br/>
                          Total: {order.grandTotal} AED
                        </Grid.Column>
                      </Grid>
                      <Divider/>
                      {order.shipments.map((shipment, index2) => (
                        <div key={index2}>
                          <Header as='h4'>Shipment {index2+1}/{order.shipments.length}</Header>
                          <Grid>
                            <Grid.Column mobile={8} tablet={4} computer={4}>
                              Estimated Pickup:<br/>{formatTime(shipment.estimatedPickup)}
                            </Grid.Column>
                            <Grid.Column mobile={8} tablet={4} computer={4}>
                              Estimated Delivery:<br/>{formatTime(shipment.estimatedDelivery)}
                            </Grid.Column>
                            <Grid.Column mobile={8} tablet={4} computer={4}>
                              Pickup Date:<br/>{formatTime(shipment.pickupDate)}
                            </Grid.Column>
                            <Grid.Column mobile={8} tablet={4} computer={4}>
                              Delivered Date:<br/>{formatTime(shipment.deliveredDate)}
                            </Grid.Column>
                          </Grid>
                          <Step.Group widths={shippingStatuses.length}>
                            {shippingStatuses.map((status, index4) => (
                              <Step disabled={shipment.status === 'cancelled'} active={shipment.status === status.value} key={index4}>
                                <Step.Content>
                                  <Step.Title>{status.text}</Step.Title>
                                </Step.Content>
                              </Step>
                            ))}
                          </Step.Group>
                          {shipment.orderedProducts.map((product, index3) => (
                            <div key={index3}>
                              <Grid>
                                <Grid.Column mobile={16} tablet={3} computer={3}>
                                  <Image src={'https://s3.ap-south-1.amazonaws.com/dibba/'+product.primaryPhoto} size='large' />
                                </Grid.Column>
                                <Grid.Column mobile={16} tablet={8} computer={8}>
                                  <Header as='h3'><Link to={'/products/'+product.product_id}>{product.title}</Link></Header>
                                  Item ID: {product.id}<br/>
                                  Sold by: {product.seller_id}<br/>
                                  {product.price} AED<br/>
                                  Shipped by: {shipment.shipper}<br/>
                                  Condition: {product.condition}<br/>
                                  Shipment Status: {shipment.status}<br/>
                                  Product Status: {product.status}<br/>
                                  Amount to Collect: {shipment.amountToCollect}
                                </Grid.Column>
                                <Grid.Column mobile={16} tablet={5} computer={5}>
                                  {<Returnbutton order={order} shipment={shipment} product={product} />}
                                </Grid.Column>
                              </Grid>
                            </div>
                          ))}
                          {index2 !== order.shipments.length-1 ? <Divider/> : <div></div>}
                        </div>
                      ))}
                    </Segment>
                  </div>
                ))}
              </Grid.Column>
            </Grid>

            <Modal open={this.state.cancelOrderModal} onClose={this.closeOrderCancelModal.bind(this)}>
              <Modal.Header>Cancel this product</Modal.Header>
              <Modal.Content scrolling>
                <Grid>
                  <Grid.Column mobile={16} tablet={2} computer={2} verticalAlign='middle'>
                    <Image src={'https://s3.ap-south-1.amazonaws.com/dibba/'+productInCancelModal.primaryPhoto} size='small' />
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Link to={'/products/'+productInCancelModal.product_id}>{productInCancelModal.title}</Link><br/>
                    ID: {productInCancelModal.id}<br/>
                    Seller: {productInCancelModal.seller_id}<br/>
                  </Grid.Column>
                </Grid>

                <Form>
                  <Form.Dropdown
                    error={this.state['cancelReasonError-'+productInCancelModal.id]}
                    label={'Reason for cancellation*' + (this.state['cancelReasonError-'+productInCancelModal.id] ? ' - '+this.state['cancelReasonErrorMessage-'+productInCancelModal.id] : '' )}
                    onChange={this.handleChange.bind(this)}
                    options={returnOptions.map((option, index) => ({ key: option, text: option, value: option }))}
                    placeholder='Select a reason'
                    selection
                    name={'reason-'+productInCancelModal.id}
                    value={this.state['reason-'+productInCancelModal.id]}
                    fluid
                  />

                  <Form.TextArea
                    label='Notes (Please provide your remarks here to help our team better process your request)'
                    name={'description-'+productInCancelModal.id}
                    value={this.state['description-'+productInCancelModal.id]}
                    onChange={this.handleChange.bind(this)} 
                    placeholder='Tell us more' 
                  />
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button onClick={this.closeOrderCancelModal.bind(this)}>Cancel</Button>
                <Button primary onClick={this.cancelProduct.bind(this)}>Confirm Product Cancellation</Button>
              </Modal.Actions>
            </Modal>

            <Modal open={this.state.cancelReturnModal} onClose={this.closeReturnCancelModal.bind(this)}>
              <Modal.Header>Are you sure you want to cancel this return</Modal.Header>
              <Modal.Content scrolling>
                <Grid>
                  <Grid.Column mobile={16} tablet={2} computer={2} verticalAlign='middle'>
                    <Image src={'https://s3.ap-south-1.amazonaws.com/dibba/'+productInCancelModal.primaryPhoto} size='small' />
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Link to={'/products/'+productInCancelModal.id}>{productInCancelModal.title}</Link><br/>
                    ID: {productInCancelModal.id}<br/>
                    Seller: {productInCancelModal.seller_id}<br/>
                  </Grid.Column>
                </Grid>
              </Modal.Content>
              <Modal.Actions>
                <Button onClick={this.closeReturnCancelModal.bind(this)}>Cancel</Button>
                <Button primary onClick={this.cancelProduct.bind(this)}>Confirm Return Cancellation</Button>
              </Modal.Actions>
            </Modal>
          </div>
        );   
      }
    }
  }
}


var returnPeriod = 86400000;


var orderStatuses = [
  'Order successful',
  'Order in progress',
  'Order error',
  'Order cancelled'
]

var shippingStatuses = [
  {value: 'order_received', text: 'Order Received'},
  {value: 'picking_up', text: 'Item pick up in progress'},
  {value: 'picked_up', text: 'Item picked up'},
  {value: 'delivering', text: 'Delivery in progress'},
  {value: 'delivered', text: 'Delivered'}
]

var orderedProductStatuses = [
  {value: 'ordered', text: 'Ordered'},
  {value: 'order_cancelled', text: 'Order Cancelled'},
  {value: 'returned', text: 'Returned'},
  {value: 'return_cancelled', text: 'Return Cancelled'},
  {value: 'return_closed', text: 'Return Window Closed'}
]

var returnOptions = [
  'Ordered wrong color/size/mode',
  'I did not like the item and I do not want it anymore',
  'Received wrong order, wrong color/size/model',
  'Item is not compatible with country standards',
  'Not as described, different from picture or description',
  'Fake, unauthentic item',
  'Received used or package already open, not as new',
  'Received missing accessories or parts',
  'Received Broken/torn',
  'Item defective, not functioning as expected, not working'
]

var formatTime = (time) => {
  var result = moment(time).tz('Asia/Dubai').format('Do MMMM YYYY, h:mm a');
  if (result === 'Invalid date') {
    result = 'n/a'
  }
  return result
}







