import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, TextArea, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import { forEachAsync } from 'forEachAsync';
import moment from 'moment';

import Seller from './Seller.jsx'
import Product from './Product.jsx'
import BankAccount from './BankAccount.jsx'
import Payout from './Payout.jsx'

export default class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsRequestComplete: false,
      items: [],
      activeItem: ''
    }
  }

  componentDidMount () {
    var self = this;
    this.getItems(self.props.match.params.items);
    this.props.history.listen((location, action) => {
      self.setState({itemsRequestComplete: false})
      self.getItems(location.pathname.substr(1))
    });
  }

  getItems (items, postData) {
    var self = this;
    console.log(items)
    if (!postData) {postData = {}}

    axios.post('/api/admin/'+items, postData)
    .then(response => {
      self.setState({
        items: response.data,
        itemsRequestComplete: true
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  updateItem (e, { item, status }) {
    var self = this;
    console.log(self.state)
    var items = self.props.match.params.items
    var updateObj = {};
    if (items === 'sellers') {
      updateObj.sellerStatus = status
    } else {
      updateObj.status = status
    }
    axios.post('/api/admin/'+items+'/'+item.id, updateObj)
    .then(response => {

      self.getItems(self.props.match.params.items, {status: self.state.activeItem});
    })
    .catch(function (error) {
      console.log(error);
    });
  }


  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  handleItemClick (e, { name }) {
    this.setState({ activeItem: name })
    this.getItems(this.props.match.params.items, {status: name})
  }

  render() {
    var self = this;
    const { itemsRequestComplete, items, photos, activeItem } = this.state;

    var components = {
      sellers: {
        component: Seller,
        statuses: ['pending', 'verified', 'rejected']
      },
      products: {
        component: Product,
        statuses: ['pending', 'verified', 'rejected']
      },
      bankAccounts: {
        component: BankAccount,
        statuses: ['new', 'validated', 'verified', 'verification_failed', 'errored']
      },
      payouts: {
        component: Payout,
        statuses: ['new', 'payout_started', 'transferred', 'payout_failed', 'errored']
      }
    }

    var Component = components[this.props.match.params.items].component
    var statuses = components[this.props.match.params.items].statuses


    if (!itemsRequestComplete) {
      return (
        <div>
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        </div>
      )
    } else {
      if (items.length === 0) {
        return (
          <div>
            <Menu secondary stackable>
              <Menu.Item><Header as='h2'>{self.props.match.params.items.charAt(0).toUpperCase() + self.props.match.params.items.slice(1)}</Header></Menu.Item>
              <Menu.Menu position='right'>
                {statuses.map((status, index) => (
                  <Menu.Item
                    key={index}
                    name={status}
                    active={activeItem === status}
                    onClick={this.handleItemClick.bind(this)} >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Menu.Item>
                ))}
              </Menu.Menu>
            </Menu>
            <Segment style={{margin: '15px 20px'}} textAlign='center' padded='very'>
              <Header as='h1'>No items to approve</Header>
            </Segment>
          </div>
        )
      } else {
        return (
          <div style={{margin: '15px 20px'}}>
            <Menu secondary stackable>
              <Menu.Item><Header as='h2'>{self.props.match.params.items.charAt(0).toUpperCase() + self.props.match.params.items.slice(1)}</Header></Menu.Item>
              <Menu.Menu position='right'>
                {statuses.map((status, index) => (
                  <Menu.Item
                    key={index}
                    name={status}
                    active={activeItem === status}
                    onClick={this.handleItemClick.bind(this)} >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Menu.Item>
                ))}
              </Menu.Menu>
            </Menu>
            {items.map((item, index1) => (
              <div key={index1} style={{margin: '15px 0'}}>
                <Component item={item} approve={()=>{}} reject={()=>{}} statuses={statuses} key={index1} />
                <Menu stackable attached='bottom' widths={statuses.length}>
                  {statuses.map((status, index2) => (
                    <Menu.Item
                      key={index2}
                      item={item}
                      status={status}
                      active={status === (self.props.match.params.items === 'sellers' ? item.sellerStatus : item.status)}
                      onClick={self.updateItem.bind(self)} >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Menu.Item>
                  ))}
                </Menu>
              </div>
            ))}
          </div>
        );   
      }
    }
  }
}
