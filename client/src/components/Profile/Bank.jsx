import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Sticky, Rail, Loader, Dimmer, Table, Button, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, TextArea } from 'semantic-ui-react'
import axios from 'axios';
import superagent from 'superagent';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import Dropzone from 'react-dropzone';
import Address from '../Cart/Address.jsx';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopupOpen: false,
      loading: false,
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      iban: '',
      status: '',
      id: ''
    }
  }

  componentDidMount () {
    this.getBankAccount();
  }

  getBankAccount () {
    var self = this;
    this.setState({loading: true});

    axios.get('/api/bank_accounts')
    .then(response => {
      self.setState({loading: false})
      if (response.data.length > 0) {
        const { id, bankName, accountHolderName, accountNumber, accountNumberLast4, ibanLast4, status } = response.data[0];
        self.setState({
          id: id || '',
          bankName: bankName || '',
          accountHolderName: accountHolderName || '',
          accountNumberLast4: accountNumberLast4,
          ibanLast4: ibanLast4,
          status: status || ''
        })      
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  save () {
    const { id, bankName, accountHolderName, accountNumber, iban } = this.state
    var self = this;
    this.setState({loading: true});

    if (this.checkFields()) {
      axios.post('/api/bank_accounts/'+id, {
        bankName: bankName,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        iban: iban
      })
      .then(response => {
        self.setState({loading: false})
        self.getBankAccount();
        self.setState({
          iban: '',
          accountNumber: ''
        })
        self.openPopup('Bank account saved');
      })
      .catch(function (error) {
        console.log(error);
      });            
    } else {
      this.setState({loading: false});
    }

  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  openPopup(message) {
    var self = this;
    self.setState({
      popupContent: message,
      isPopupOpen: true 
    })

    self.timeout = setTimeout(() => {
      self.setState({ isPopupOpen: false })
    }, 2500)
  }

  handleClosePopup () {
    this.setState({ isPopupOpen: false })
    clearTimeout(this.timeout)
  }

  checkFields () {
    var self = this
    const { bankName, accountHolderName, accountNumber, accountNumberLast4, iban, ibanLast4 } = this.state

    var checkPass = true;

    var fields = ['bankName', 'accountHolderName']
    var value = {
      bankName: 'bank name',
      accountHolderName: 'account holder name',
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

    if (accountNumberLast4) { // if updating
      if (accountNumber.length !== 0) {
        if (accountNumber.length < 3 || accountNumber.length > 17  || isNaN(accountNumber)) {
          checkPass = false;
          this.setState({
            accountNumberError: true,
            accountNumberErrorMessage: 'Please enter a valid account number'
          })
        } else {
          this.setState({
            accountNumberError: false,
            accountNumberErrorMessage: ''
          })
        }  
      }
    } else { // if new
      if (accountNumber.length < 3 || accountNumber.length > 17  || isNaN(accountNumber)) {
        checkPass = false;
        this.setState({
          accountNumberError: true,
          accountNumberErrorMessage: 'Please enter a valid account number'
        })
      } else {
        this.setState({
          accountNumberError: false,
          accountNumberErrorMessage: ''
        })
      }      
    }

    if (ibanLast4) { // if updating
      if (iban.length !== 0) {
        if (iban.substr(0,2) !== 'AE' || iban.length !== 23 || isNaN(iban.substr(2))) {
          checkPass = false;
          this.setState({
            ibanError: true,
            ibanErrorMessage: 'Please enter a valid IBAN number'
          })
        } else {
          this.setState({
            ibanError: false,
            ibanErrorMessage: ''
          })
        }  
      }
    } else { // if new
      if (iban.substr(0,2) !== 'AE' || iban.length !== 23 || isNaN(iban.substr(2))) {
        checkPass = false;
        this.setState({
          ibanError: true,
          ibanErrorMessage: 'Please enter a valid IBAN number'
        })
      } else {
        this.setState({
          ibanError: false,
          ibanErrorMessage: ''
        })
      }      
    }

    return checkPass
  }



  render() {
    const { loading, bankName, accountHolderName, accountNumber, accountNumberLast4, iban, ibanLast4, status } = this.state
    const { bankNameError, bankNameErrorMessage, accountHolderNameError, accountHolderNameErrorMessage, accountNumberError, accountNumberErrorMessage, ibanError, ibanErrorMessage } = this.state


    return (
      <Segment id='bank'>
        <Header as='h3'>Bank Account</Header>
        <Form>
          <Grid>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Dropdown
                error={bankNameError}
                label={'Bank Name' + (bankNameError ? ' - '+bankNameErrorMessage : '')}
                onChange={this.handleChange.bind(this)}
                options={banks.map(option => ({ key: option, text: option, value: option }))}
                placeholder='Select a bank'
                selection
                search
                name='bankName'
                value={bankName}
              />
              <Form.Input error={accountHolderNameError} label={'Account holder name' + (accountHolderNameError ? ' - '+accountHolderNameErrorMessage : '')} placeholder='Account holder name' value={accountHolderName} name='accountHolderName' onChange={this.handleChange.bind(this)} />              
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Input
                error={accountNumberError} 
                label={'Account number' + (accountNumberError ? ' - '+accountNumberErrorMessage : '')} 
                placeholder={accountNumberLast4 ? '····'+accountNumberLast4 : 'Account number'} 
                value={accountNumber} 
                name='accountNumber' 
                onChange={this.handleChange.bind(this)}
              />
              <Form.Input 
                error={ibanError} 
                label={'IBAN' + (ibanError ? ' - '+ibanErrorMessage : '')} 
                placeholder={ibanLast4 ? '····'+ibanLast4 : 'IBAN'} 
                value={iban}
                name='iban' 
                onChange={this.handleChange.bind(this)} />
            </Grid.Column>
          </Grid>
          {status ? (<Header as='h4'>Status: {status}</Header>) : (<div/>)}
          <Divider/>
          <Grid>
            <Grid.Column mobile={1} tablet={13} computer={13}/>
            <Grid.Column mobile={13} tablet={3} computer={3}>
              <Popup
                trigger={<Button primary fluid onClick={this.save.bind(this)}>Save</Button>}
                content={this.state.popupContent}
                on='click'
                position='top right'
                open={this.state.isPopupOpen}
                onClose={this.handleClosePopup.bind(this)}
              />
            </Grid.Column>
          </Grid>
        </Form>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
      </Segment>
    );
  }
}


var banks = [
  'Abu Dhabi Commercial Bank',
  'Abu Dhabi Islamic Bank',
  'Arab Bank plc',
  'Bank of Baroda',
  'Arab Emirates Investment Bank',
  'Bank of Sharjah',
  'Citi Bank UAE',
  'Commercial Bank International',
  'Commercial Bank of Dubai',
  'Dubai Islamic Bank',
  'Emirates Islamic Bank',
  'First Gulf Bank',
  'Habib Bank AG Zurich',
  'HSBC Bank Middle East Limited',
  'Invest Bank',
  'Mashreq Bank',
  'National Bank of Fujairah',
  'National Bank of Umm Al-Qaiwain',
  'Noor Bank',
  'RAKBANK',
  'Sharjah Islamic Bank',
  'Union National Bank',
  'United Arab Bank',
  'United Emirates Bank',
]










