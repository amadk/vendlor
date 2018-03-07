import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, TextArea, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import { forEachAsync } from 'forEachAsync';
import moment from 'moment-timezone';

export default class Shipment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shipmentsRequestComplete: false,
      shipments: [],
      activeshipment: ''
    }
  }

  componentDidMount () {
    var self = this;
    this.getShipments();
    this.props.history.listen((location, action) => {
      self.setState({shipmentsRequestComplete: false})
      self.getShipments()
    });
  }

  getShipments () {
    var self = this;
    var postData = this.props.match.params.status === 'delivered' ? {status: 'Delivered'} : {}

    axios.post('/api/admin/shipments/', postData)
    .then(response => {
      console.log(response)
      var state = {
        shipments: response.data,
        shipmentsRequestComplete: true
      };

      response.data.forEach(shipment => {
        ['estimatedPickup', 'estimatedDelivery', 'pickupDate', 'deliveredDate'].forEach(key => {
          var date = moment(shipment[key]).tz('Asia/Dubai').format('YYYY-MM-DD');
          var time = moment(shipment[key]).tz('Asia/Dubai').format('HH:mm');

          state[shipment.id+'-'+key+'-date'] = date.includes('Invalid date') ? '' : date;
          state[shipment.id+'-'+key+'-time'] = time.includes('Invalid date') ? '' : time;
        })
      })
      self.setState(state)
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  updateShipmentTime (e, { shipment }) {
    var self = this;

    var postData = {};

    ['estimatedPickup', 'estimatedDelivery', 'pickupDate', 'deliveredDate'].forEach(key => {
      var date = moment(self.state[shipment.id+'-'+key+'-date']).format('YYYY-MM-DD')+' '+self.state[shipment.id+'-'+key+'-time']+':00';
      postData[key] = date.includes('Invalid date') ? null : date;
    })

    console.log(postData)

    axios.post('/api/admin/shipments/'+shipment.id, postData)
    .then(response => {
      console.log(response)
      self.getShipments();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  updateShipmentStatus (e, { shipment, status }) {
    var self = this;

    axios.post('/api/admin/shipments/'+shipment.id, {
      status: status
    })
    .then(response => {
      console.log(response)
      self.getShipments();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) {
    // console.log(name, value)
    this.setState({ [name]: value }) 
  }

  render () {
    var self = this
    const { shipmentsRequestComplete, shipments, activeItem } = this.state;

    return (
      <div>
        <Menu secondary stackable>
          <Menu.Item><Header as='h2'>Shipments</Header></Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item as={Link} to='/shipments/intransit'>In Transit</Menu.Item>
            <Menu.Item as={Link} to='/shipments/delivered'>Delivered</Menu.Item>
          </Menu.Menu>
        </Menu>
        {shipments.map((shipment, index) => (
          <Segment key={index}>
            <Grid>
              <Grid.Column mobile={16} tablet={8} computer={8}>
                ID: {shipment.id}<br/>
                Amount to collect: {shipment.amountToCollect}<br/>
                Shipment Type: {shipment.shipmentType}<br/>
                Shipment Speed: {shipment.shipmentSpeed}<br/>
                Status: {shipment.status}<br/>
                Shipper: {shipment.shipper}<br/>
              </Grid.Column>
              <Grid.Column mobile={16} tablet={8} computer={8}>
                Estimated Pickup: {moment(shipment.estimatedPickup).format('Do MMMM YYYY, h:mm:ss a')}<br/>
                Estimated Delivery: {moment(shipment.estimatedDelivery).format('Do MMMM YYYY, h:mm:ss a')}<br/>
                Pickup Date: {moment(shipment.pickupDate).format('Do MMMM YYYY, h:mm:ss a')}<br/>
                Delivered Date: {moment(shipment.deliveredDate).format('Do MMMM YYYY, h:mm:ss a')}<br/>
                Created At: {moment(shipment.createdAt).format('Do MMMM YYYY, h:mm:ss a')}
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                pickupAddress: {shipment.pickupAddress}<br/>
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                deliveryAddress: {shipment.deliveryAddress}<br/>
              </Grid.Column>
            </Grid>
            <Divider/>
            <Menu stackable widths={statuses.length}>
              {statuses.map((status, index) => (
                <Menu.Item
                  key={index}
                  status={status.value}
                  shipment={shipment}
                  active={shipment.status === status.value}
                  onClick={this.updateShipmentStatus.bind(this)} >
                  {status.text}
                </Menu.Item>
              ))}
            </Menu>
            <Divider/>
            <Grid>
              {['estimatedPickup', 'estimatedDelivery', 'pickupDate', 'deliveredDate'].map((date, index) => (
                <Grid.Column mobile={8} tablet={4} computer={4} key={index}>
                  <Form>
                    <label>{date}</label>
                    <Form.Input placeholder='date' type='date' name={shipment.id+'-'+date+'-date'} value={self.state[shipment.id+'-'+date+'-date']} onChange={this.handleChange.bind(this)} /> 
                    <Form.Input placeholder='time' type='time' name={shipment.id+'-'+date+'-time'} value={self.state[shipment.id+'-'+date+'-time']} onChange={this.handleChange.bind(this)} />
                  </Form>
                </Grid.Column>
              ))}
            </Grid>
            <Grid>
              <Grid.Column mobile={1} tablet={13} computer={13}/>
              <Grid.Column mobile={13} tablet={3} computer={3}>
                <Button primary fluid shipment={shipment} onClick={this.updateShipmentTime.bind(this)}>Save</Button>
              </Grid.Column>
            </Grid>
          </Segment>
      ))}
      </div>
    )

  }
}

var shipmentTime

var statuses = [
  {value: 'order_received', text: 'Order Received'},
  {value: 'picking_up', text: 'Item pick up in progress'},
  {value: 'picked_up', text: 'Item picked up'},
  {value: 'delivering', text: 'Delivery in progress'},
  {value: 'delivered', text: 'Delivered'}
]
