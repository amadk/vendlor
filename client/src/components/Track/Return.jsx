import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Segment, TextArea, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import { forEachAsync } from 'forEachAsync';
import moment from 'moment';

class Return extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderRequestComplete: false,
      checkedProducts: [],
      returnItems: [],
      description: ''
    }
  }

  componentDidMount () {
    this.getOrders();
  }

  getOrders () {
    var self = this;
    axios.get('/api/orderedProducts/return')
    .then(response => {
      self.setState({
        returnItems: response.data,
        orderRequestComplete: true
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  toggle (e, { name }) {
    this.setState({
      [name]: !this.state[name]
    })
  }

  confirmReturn () {
    this.createOrder();
  }

  checkFields (products) {
    var self = this
    var checkPass = true;

    products.forEach(product => {
      var productId = product.id;
      if (!self.state['reason-'+productId]) {
        checkPass = checkPass && false;
        self.setState({
          ['returnReasonError-'+productId]: true,
          ['returnReasonErrorMessage-'+productId]: 'Please select a return reason'
        })
      } else {
        self.setState({
          ['returnReasonError-'+productId]: false,
          ['returnReasonErrorMessage-'+productId]: ''
        })
      }
    })

    return checkPass
  }

  createOrder () {
    const { orders, returnItems } = this.state;
    var self = this;
    
    if (returnItems.length > 0 && this.checkFields(returnItems)) {
      var totalCost = 0;
      var totalShipping = 0;
      var shipping = 12

      var shipments = [];

      returnItems.forEach(product => {
        totalCost+=product.price;
        var shipment = shipments.filter(shipment => (shipment.shipmentId === product.shipment_id))[0]
        if (!shipment) {
          shipments.push({
            shipmentId: product.shipment_id,
            pickupAddress: product.deliveryAddress,
            deliveryAddress: product.pickupAddress,
            productIds: [product.id],
            orderId: product.order_id
          });
        } else {
          if (shipment.productIds.indexOf(product.id) === -1) {
            shipment.productIds.push(product.id)
          }
        }
      })

      totalShipping = shipments.length * 12

      forEachAsync(shipments, (next1, shipment, index1) => {
        self.createShipment(shipment, shipmentResponse => {
          forEachAsync(shipment.productIds, (next2, productId, index2) => {
            var product = returnItems.filter(product => (product.id === productId))[0];
            self.updateOrderedProduct(shipmentResponse.data.id, product, next2)
          }).then(next1)
        })
      }).then(() => {
        self.props.history.push('/track')
      })     
    }
  }

  createShipment (shipment, callback) {
    var self = this;
    axios.post('/api/orders/'+shipment.orderId+'/shipments', {
      pickupAddress: shipment.pickupAddress,
      deliveryAddress: shipment.deliveryAddress,
      type: 'return',
      speed: 'Next day',
      shipper: 'Wing',
      productIds: shipment.productIds,
      amountToCollect: 0
    })
    .then(function (response) {
      callback(response)
    })
    .catch(function (error) {
      console.log(error);
    }); 
  }

  updateOrderedProduct (shipmentId, product, callback) {
    var self = this;
    axios.post('/api/orders/'+product.order_id+'/shipments/'+shipmentId+'/products/'+product.id, {
      comission: 0,
      sellerRevenue: 0,
      platformRevenue: 0,
      returnReason: returnOptions[self.state['reason-'+product.id]],
      returnDetails: self.state['description-'+product.id],
      returnCart: false,
      status: 'returned'
    })
    .then(function (response) {
      callback();
    })
    .catch(function (error) {
      console.log(error);
    }); 
  }

  render() {
    var self = this;
    const { orderRequestComplete, returnItems, description } = this.state

    if (!orderRequestComplete) {
      return (
        <div>
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        </div>
      )
    } else {
      if (returnItems.length === 0) {
        return (
          <Segment textAlign='center' padded='very'>
            <Header as='h1'>Your don't have any return items</Header>
          </Segment>
        )
      } else {
        return (
          <Grid centered>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Segment>
                {returnItems.map((product, index) => (
                  <div key={index}>
                    <Grid>
                      <Grid.Column mobile={16} tablet={2} computer={2} verticalAlign='middle'>
                        <Image src={'https://s3.ap-south-1.amazonaws.com/vendlor/'+product.primaryPhoto} size='small' />
                      </Grid.Column>
                      <Grid.Column mobile={16} tablet={8} computer={8}>
                        <Link to={'/products/'+product.product_id}>{product.title}</Link><br/>
                        ID: {product.id}<br/>
                        Seller: {product.seller_id}<br/>
                      </Grid.Column>
                    </Grid>

                    <Header as='h4'>Reason for return*</Header>
                    <Form>
                      <Form.Dropdown
                        error={this.state['returnReasonError-'+product.id]}
                        label={'Reason for return*' + (this.state['returnReasonError-'+product.id] ? ' - '+this.state['returnReasonErrorMessage-'+product.id] : '' )}
                        onChange={this.handleChange.bind(this)}
                        options={returnOptions.map((option, index) => ({ key: index, text: option, value: index }))}
                        placeholder='Select a reason'
                        selection
                        name={'reason-'+product.id}
                        value={self.state['reason-'+product.id]}
                        fluid
                      />

                      <Form.TextArea
                        label='Notes (Please provide your remarks here to help our team better process your request)'
                        name={'description-'+product.id}
                        value={self.state['description-'+product.id]} 
                        placeholder='Tell us more'
                      />
                    </Form>
                    <Divider/>
                  </div>
                ))}
                <Menu secondary>
                  <Menu.Menu position='right'>
                    <Menu.Item><Button as={Link} to='/track'>Cancel</Button></Menu.Item>
                    <Menu.Item><Button primary onClick={this.confirmReturn.bind(this)}>Confirm Return</Button></Menu.Item>
                  </Menu.Menu>
                </Menu>
              </Segment>
            </Grid.Column>
          </Grid>
        )
      }
    }
  }
}

export default withRouter(Return)

var returnPeriod = 86400000;


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


