import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Message, Loader, Dimmer, Button, Icon, Input, Form, Dropdown, Grid, Label, Header, Popup, Divider } from 'semantic-ui-react'
import axios from 'axios';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopupOpen: false,
      loading: false,
      amount: '',
      payouts: [],
      bank: {}
    }
  }

  componentDidMount () {
    this.getPayout();
    this.getBankAccount();
  }

  getPayout () {
    var self = this;
    this.setState({loading: true});

    axios.get('/api/payouts')
    .then(response => {
      self.setState({loading: false})
      self.setState({payouts: response.data})
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  getBankAccount () {
    var self = this;
    axios.get('/api/bank_accounts')
    .then(response => {
      if (response.data.length > 0) {
        self.setState({
          bank: response.data[0]
        })
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  save () {
    const { amount, bank } = this.state
    var self = this;
    this.setState({loading: true});

    if (this.checkFields()) {
      axios.post('/api/payouts', {
        amount: amount,
        destination: bank.id
      })
      .then(response => {
        self.setState({loading: false})
        if (response.data.error) {
          self.setState({
            amountError: true,
            amountErrorMessage: 'Error: '+response.data.serverMessage
          })
        } else {
          self.openPopup(response.data);
          self.getPayout()          
        }
      })
      .catch(function (error) {
        console.log(error);
      });      
    } else {
      this.setState({loading: false})
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
    var checkPass = true;

    if (!this.state.bank) {
      checkPass = false;
      this.setState({
        amountError: true,
        amountErrorMessage: 'Please create a valid bank account'
      })
    } else if (this.state.bank.status !== 'verified') {
      checkPass = false;
      this.setState({
        amountError: true,
        amountErrorMessage: 'Your bank account is not verified yet'
      })
    } else if (this.state.amount.length === 0) {
      checkPass = false;
      this.setState({
        amountError: true,
        amountErrorMessage: 'Please enter a payout amount'
      })
    } else if (isNaN(this.state.amount)) {
      checkPass = false;
      this.setState({
        amountError: true,
        amountErrorMessage: 'Payout amount must be a number'
      })
    } else if (this.state.amount < 10) {
      checkPass = false;
      this.setState({
        amountError: true,
        amountErrorMessage: 'Payout amount must be at least 10 AED'
      })
    } else {
      this.setState({
        amountError: false,
        amountErrorMessage: ''
      })
    }

    return checkPass
  }


  render() {
    const { amount, loading, payouts, amountError, amountErrorMessage } = this.state

    return (
      <Segment id='payout'>
        <Header as='h3'>Payouts</Header>

        <Message negative visible={amountError} hidden={!amountError}>
          <p>{amountErrorMessage}</p>
        </Message>

        <Form onSubmit={this.save.bind(this)}>
          <Grid>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Field error={amountError}>
                {/*<label>{'Amount' + (amountError ? ' - '+amountErrorMessage : '')}</label>*/}
                <Input label='AED' labelPosition='right' placeholder='Payout amount in AED' value={amount} name='amount' onChange={this.handleChange.bind(this)} />
              </Form.Field>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={4} computer={4}>
              <Form.Button fluid primary content='Create Payout' />
            </Grid.Column>
          </Grid>
        </Form>

        <Divider horizontal={payouts.length === 0} />
        {payouts.map((payout, index) => (
          <Segment key={index}>
            Amount: {payout.amount}<br/>
            Status: {payout.status}
          </Segment>
        ))}
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
      </Segment>
    );
  }
}
