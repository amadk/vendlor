import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Table, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';


export default class Address extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addressRequestComplete: false,
      addresses: [],
      address: '',
      addressValue: '',
    }
  }

  componentDidMount () {
    this.getAddresses()
  }

  getAddresses () {
    var self = this;
    axios.get('/api/addresses')
    .then(response => {
      var addresses = response.data.reverse()
      self.setState({
        addresses: addresses,
        addressRequestComplete: true
      })
      // if (addresses.length > 0) {
      //   self.props.selectAddressId(addresses[0].id);        
      // }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  handleAddressChange (e, { value }) { 
    this.props.selectAddressId(value);
  }


  editAddress (e, { value }) {
    this.props.openAddressForm(this.state.addresses[value])
  }

  openAddressForm () {
    this.props.openAddressForm()
  }

  deleteAddress (e, { addressid }) {
    var self = this;
    axios.delete('/api/addresses/'+addressid)
    .then(function (response) {
      self.getAddresses();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  render() {
    var self = this;
    const { value, addresses, addressRequestComplete } = this.state
    
    if (!addressRequestComplete) {
      return (
        <div>
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        </div>
      )
    } else {
      if (addresses.length === 0) {
        return (
          <div id='address'>
            <Menu attached='top' borderless>
              <Menu.Item>
                <Header as='h4'>Select an address</Header>
              </Menu.Item>

              <Menu.Menu position='right'>
                <Menu.Item>
                  {/*<Button primary onClick={this.openAddressModal.bind(this)}>Add new address</Button>*/}
                  <Button primary onClick={this.openAddressForm.bind(this)}>Add new address</Button>
                </Menu.Item>
              </Menu.Menu>
            </Menu>
            <Segment attached='bottom' textAlign='center' padded='very'>
              <Header as='h1'>No addresses found</Header>
            </Segment>
          </div>
        )
      } else {
        return (
          <div id='address'>
            <Menu attached='top' borderless>
              <Menu.Item>
                <Header as='h4'>Select an address</Header>
              </Menu.Item>

              <Menu.Menu position='right'>
                <Menu.Item>
                  {/*<Button primary onClick={this.openAddressModal.bind(this)}>Add new address</Button>*/}
                  <Button primary onClick={this.openAddressForm.bind(this)}>Add new address</Button>
                </Menu.Item>
              </Menu.Menu>
            </Menu>
            <Segment attached='bottom'>
              <Grid relaxed>
                {addresses.map((address, index) => (
                  <Grid.Column mobile={16} tablet={5} computer={5} key={index}>
                    <Card>
                      <Card.Content textAlign='left'>
                        <Header as='h4'>{address.fullName}</Header>
                        <List>
                          <List.Item>{address.googleMapsAddress}</List.Item>
                          {/*<List.Item>{address.addressLine1}</List.Item>
                          <List.Item>{address.addressLine2}</List.Item>
                          <List.Item>{address.city + ', '+address.region+' '+address.zip}</List.Item>*/}
                          <List.Item>Suite #: {address.suiteNumber}</List.Item>
                          <List.Item>{address.country}</List.Item>
                          <List.Item>Mobile #: {address.mobile}</List.Item>
                          <List.Item>{address.additionalInfo}</List.Item>
                        </List>
                      </Card.Content>
                      {this.props.selection ? (
                        <Card.Content extra>
                          <Radio
                            label='Deliver to this address'
                            name='radioGroup'
                            value={address.id}
                            checked={this.props.selectedAddressId === address.id}
                            onChange={this.handleAddressChange.bind(this)}
                          />
                        </Card.Content>
                        ) : (<div/>)
                      }
                      <Card.Content extra>
                        <div className='ui two buttons'>
                          <Button basic color='green' value={index} onClick={this.editAddress.bind(this)}>Edit</Button>
                          <Button basic color='red' addressid={address.id} onClick={this.deleteAddress.bind(this)}>Delete</Button>
                        </div>
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                ))}
              </Grid>
            </Segment>
          </div>
        )
      }
    }
  }
}







