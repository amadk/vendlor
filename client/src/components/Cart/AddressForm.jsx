import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Segment, Table, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';


export default class Address extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addressOptions: [],
      searchQuery: '',

      addressLine1: '',
      addressLine2: '',
      city: '',
      region: '',
      zip: '',

      fullName: '',
      googleMapsAddress: '',
      suiteNumber: '',
      country: 'United Arab Emirates',
      mobile: '',
      additionalInfo: '',
      googleMapsPlaceId: "ChIJvRKrsd9IXj4RpwoIwFYv0zM"
    }
  }

  componentDidMount () {
    var self = this
    const { fullName, googleMapsAddress, googleMapsPlaceId, country, city, suiteNumber, mobile, additionalInfo } = this.props.addressToEdit;
    
    this.setState({
      fullName: fullName || '',
      googleMapsAddress: googleMapsAddress || '',
      googleMapsPlaceId: googleMapsPlaceId || self.state.googleMapsPlaceId,
      country: country || 'United Arab Emirates',
      city: city || '',
      suiteNumber: suiteNumber || '',
      mobile: mobile ? mobile.substr(4) : '',
      additionalInfo: additionalInfo || '',
      searchQuery: googleMapsAddress || ''
    })
    if (!this.props.addressToEdit.mobile || this.props.addressToEdit.mobile.length === 0 ) {
      this.getPhone();      
    }
  }

  getPhone () {
    var self = this;

    axios.get('/api/accounts')
    .then(function (response) {

      const { mobile } = response.data;
      self.setState({
        mobile: mobile ? mobile.substr(4) : ''
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }


  createAddress () {
    var self = this;
    const { googleMapsPlaceId, mobile, googleMapsAddress, suiteNumber, fullName, addressLine1, addressLine2, city, country, additionalInfo } = this.state


    if (this.checkFields()) {
      axios.post('/api/addresses/'+(this.state.id || ''), {
        fullName: fullName,
        googleMapsAddress: googleMapsAddress,
        googleMapsPlaceId: googleMapsPlaceId,
        addressLine2: addressLine2,
        suiteNumber: suiteNumber,
        city: city,
        country: country,
        mobile: '+971'+mobile,
        additionalInfo: additionalInfo
      })
      .then(function (response) {
        self.props.closeAddressForm()
      })
      .catch(function (error) {
        console.log(error);
      });
    }

  }


  handleAddressChange (e, {value, searchQuery}) { 
    var addressOption = this.state.addressOptions.filter(option => option.value===value)[0];
    addressOption = addressOption ? addressOption.text : searchQuery;
    this.setState({
      googleMapsAddress: addressOption,
      googleMapsPlaceId: value
    }) 
  }

  handleSearchChange (e, { searchQuery }) {
    var self = this;
    this.setState({ googleMapsAddress: searchQuery })
    axios.get('/api/addresses/googlemaps?q='+searchQuery)
    .then(function (response) {
      self.setState({
        addressOptions: response.data.predictions.map(option=>({key: option.description, value: option.place_id, text: option.description}))
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  checkFields () {
    var self = this
    var checkPass = true;

    var fields = ['fullName', 'googleMapsAddress', 'city', 'suiteNumber']
    var value = {
      fullName: 'full name',
      googleMapsAddress: 'address',
      suiteNumber: 'suite number',
      city: 'city'
    }

    fields.forEach(field => {
      if (self.state[field].length === 0) {
        checkPass = false;
        var obj = {};
        obj[field+'Error'] = true;
        obj[field+'ErrorMessage'] = 'Please enter '+value[field]
        this.setState(obj)
      } else {
        var obj = {};
        obj[field+'Error'] = false;
        obj[field+'ErrorMessage'] = ''
        this.setState(obj)
      }
    })

    return checkPass
  }


  render() {
    var self = this;
    const { googleMapsPlaceId, mobile, googleMapsAddress, suiteNumber, addressOptions, searchQuery, fullName, addressLine1, addressLine2, city, region, zip, country, phone, additionalInfo } = this.state
    const { cityError, cityErrorMessage, fullNameError, fullNameErrorMessage, googleMapsAddressError, googleMapsAddressErrorMessage, suiteNumberError, suiteNumberErrorMessage  } = this.state

    return (
      <Grid centered>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          <Segment>
            <Header as='h3'>Add new address</Header>
            <Form onSubmit={this.createAddress.bind(this)}>

              <Grid>
                <Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.Input error={fullNameError} label={'Full Name' + (fullNameError ? ' - '+fullNameErrorMessage : '')} fluid name='fullName' placeholder='i.e John Doe' value={fullName} onChange={this.handleChange.bind(this)} />                
                </Grid.Column>

                <Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.Dropdown
                    error={googleMapsAddressError}
                    label={'Enter Address' + (googleMapsAddressError ? ' - '+googleMapsAddressErrorMessage : '')}
                    fluid
                    onChange={this.handleAddressChange.bind(this)}
                    onSearchChange={this.handleSearchChange.bind(this)}
                    options={addressOptions/*.map(option=>({value: option, key: option, text: option}))*/}
                    placeholder='Address'
                    search
                    searchQuery={googleMapsAddress}
                    selection
                    value={googleMapsPlaceId}
                  />
                  {/*<iframe
                    frameBorder="0"
                    style={{"border": 0, width: '100%', height: '300px'}}
                    src={"https://www.google.com/maps/embed/v1/place?key="+key+"&q=place_id:"+googleMapsPlaceId} allowFullScreen>
                  </iframe>*/}
                </Grid.Column>

                <Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.Input label='Address line 2' fluid name='addressLine2' placeholder='e.g Near Clocktower' value={addressLine2} onChange={this.handleChange.bind(this)} />                
                </Grid.Column>

                <Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.Input error={suiteNumberError} label={'Suite Number' + (suiteNumberError ? ' - '+suiteNumberErrorMessage : '')} fluid placeholder='i.e 101, 703' name='suiteNumber' value={suiteNumber} onChange={this.handleChange.bind(this)} />                
                </Grid.Column>

                <Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.Dropdown
                    error={cityError}
                    label={'City' + (cityError ? ' - '+cityErrorMessage : '')}
                    fluid
                    onChange={this.handleChange.bind(this)}
                    options={['Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah', 'Ajman', 'Al Ain', 'Fujairah', 'Umm al-Quwain'].map(option=>({value: option, key: option, text: option}))}
                    placeholder='City'
                    selection
                    name='city'
                    value={city}
                  />
                </Grid.Column>

                <Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.Input fluid label='Country' value={country} disabled/>                
                </Grid.Column>

                {/*<Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.Field>
                    <label>Mobile Number</label>
                    <Input fluid label='+971' labelPosition='left' placeholder='i.e 501234567' name='mobile' value={mobile} onChange={this.handleChange.bind(this)}/>                
                  </Form.Field>
                </Grid.Column>*/}

                <Grid.Column mobile={16} tablet={16} computer={16}>
                  <Form.TextArea label='Additional Information' name='additionalInfo' placeholder="e.g. Access code '123' or 'Buzzer - #504' or 'Key' or 'Smart Card'" value={additionalInfo} onChange={this.handleChange.bind(this)} />                
                </Grid.Column>

                {/*fields.map((field, index) => (
                  <Grid.Column mobile={16} tablet={16} computer={16}>
                    <Form.Input fluid label={field.label} name={self.state[field.name]} placeholder={field.placeholder} value={self.state[field.name]} onChange={this.handleChange.bind(this)} />                
                  </Grid.Column>
                ))*/}
              </Grid>
            </Form>

            <Segment basic>
              <Grid>
                <Grid.Column mobile={16} tablet={8} computer={8}/>
                <Grid.Column mobile={16} tablet={3} computer={3}>
                  <Button fluid color='grey' onClick={this.props.closeAddressForm}>Cancel</Button>
                </Grid.Column>
                <Grid.Column mobile={16} tablet={5} computer={5}>
                  <Button fluid color='blue' content='Add Address' onClick={this.createAddress.bind(this)} />
                </Grid.Column>
              </Grid>
            </Segment>
          </Segment>
        </Grid.Column>
      </Grid>
    )
  }
}


var fields = [
      {
        name: 'suiteNumber',
        label: 'Suite Number',
        placeholder: 'i.e 102, 204'
      },
      {
        name: 'fullName',
        label: 'Full Name',
        placeholder: ''
      },
      {
        name: 'addressLine1',
        label: 'Address line 1',
        placeholder: 'Street address, P.O box, company name, etc'
      },
      {
        name: 'addressLine2',
        label: 'Address line 2',
        placeholder: 'Apartment, suite, unit, building, floor, etc'
      },
      {
        name: 'city',
        label: 'City',
        placeholder: ''
      },
      {
        name: 'state',
        label: 'State/Province/Region',
        placeholder: ''
      },
      {
        name: 'zip',
        label: 'ZIP',
        placeholder: ''
      },
      {
        name: 'country',
        label: 'Country',
        placeholder: ''
      },
      {
        name: 'phone',
        label: 'Phone number',
        placeholder: ''
      },
      {
        name: 'additionalInfo',
        label: 'Additional Information',
        placeholder: "e.g. Access code '123' or 'Buzzer - #504' or 'Key' or 'Smart Card'"
      },
      
    ]




