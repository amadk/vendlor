import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Accordion, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import moment from 'moment-timezone';

export default class Track extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      salesRequestComplete: false,
      shipments: []
    }
  }

  componentDidMount () {
    this.getSales();
  }

  getSales (callback) {
    var self = this;
    axios.get('/api/sales')
    .then(response => {
      console.log(response)
      self.setState({
        shipments: response.data,
        salesRequestComplete: true
      })
      if (callback) { callback() }
    })
    .catch(function (error) {
      console.log(error);
    });
  }



  handleChange (e, { name, value }) { this.setState({ [name]: value }) }


  render() {
    var self = this;
    const { salesRequestComplete, shipments } = this.state;

    if (!salesRequestComplete) {
      return (
        <div>
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        </div>
      )
    } else {
      if (shipments.length === 0) {
        return (
          <div>
            <Menu secondary stackable>
              <Menu.Item><Header as='h2'>Track</Header></Menu.Item>
              <Menu.Menu position='right'>
                <Menu.Item active={this.props.location.pathname === '/track'} as={Link} to='/track'>Purchases</Menu.Item>
                <Menu.Item active={this.props.location.pathname === '/sales'} as={Link} to='/sales'>Sales</Menu.Item>
                <Menu.Item active={this.props.location.pathname === '/return'} as={Link} to='/return'>Return Cart</Menu.Item>
                <Menu.Item/>
              </Menu.Menu>
            </Menu>
            <Segment textAlign='center' padded='very'>
              <Header as='h1'>Your don't have any past sales</Header>
            </Segment>
          </div>
        )
      } else {
        return (
          <div>
            <Menu secondary stackable>
              <Menu.Item><Header as='h2'>Track</Header></Menu.Item>
              <Menu.Menu position='right'>
                <Menu.Item active={this.props.location.pathname === '/track'} as={Link} to='/track'>Purchases</Menu.Item>
                <Menu.Item active={this.props.location.pathname === '/sales'} as={Link} to='/sales'>Sales</Menu.Item>
                <Menu.Item active={this.props.location.pathname === '/return'} as={Link} to='/return'>Return Cart</Menu.Item>
                <Menu.Item/>
              </Menu.Menu>
            </Menu>
            <Grid>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                {shipments.map((shipment, index2) => (
                  <Segment key={index2} style={{margin: '15px 0px'}}>
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
                            <Image src={'https://s3.ap-south-1.amazonaws.com/vendlor/'+product.primaryPhoto} size='large' />
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
                          </Grid.Column>
                        </Grid>
                      </div>
                    ))}
                  </Segment>
                ))}
              </Grid.Column>
            </Grid>
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

var formatTime = (time) => {
  var result = moment(time).tz('Asia/Dubai').format('Do MMMM YYYY, h:mm a');
  if (result === 'Invalid date') {
    result = 'n/a'
  }
  return result
}







