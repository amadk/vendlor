import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Sticky, Rail, Loader, Dimmer, Table, Button, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, TextArea } from 'semantic-ui-react'
import axios from 'axios';
import superagent from 'superagent';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import Dropzone from 'react-dropzone';

import Account from './Account.jsx';
import Seller from './Seller.jsx';
import Address from '../Cart/Address.jsx';
import AddressForm from '../Cart/AddressForm.jsx';
import Bank from './Bank.jsx';
import Payout from './Payout.jsx';



const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addressForm: false,
      addressToEdit: {}
    }
  }

  openAddressForm (address) { 
    this.setState({ 
      addressToEdit: address || {},
      addressForm: true 
    }) 
  }

  closeAddressForm () { this.setState({ addressForm: false }) }


  render() {
    const { addressForm, addressToEdit } = this.state

    if (addressForm) { return (<AddressForm addressToEdit={addressToEdit} closeAddressForm={this.closeAddressForm.bind(this)} />) }

    return (
      <div>
        <Grid>
          <Grid.Column mobile={16} tablet={3} computer={3}>
            <div style={{position: 'sticky', top: '75px'}}>
              <Menu vertical fluid>
                <Menu.Item href='#account'>Account</Menu.Item>
                <Menu.Item href='#address'>Addresses</Menu.Item>
                <Menu.Item href='#seller'>Seller</Menu.Item>
                <Menu.Item href='#bank'>Bank Accounts</Menu.Item>
                <Menu.Item href='#payout'>Payouts</Menu.Item>
              </Menu>
            </div>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={13} computer={13}>
            <Account />
            <Address openAddressForm={this.openAddressForm.bind(this)} />
            <Seller />
            <Bank />
            <Payout />
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
