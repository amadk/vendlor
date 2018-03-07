import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Table, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import forEachAsync from 'forEachAsync';


class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [],
      cardModalOpen: false,

      name: '',
      number: '',
      month: '',
      year: '',
      code: '',
    }
  }

  componentDidMount () {

  }


  handleChange (e, { name, value }) { this.setState({ [name]: value }) }
  
  handlePaymentChange (e, { value }) { 
    this.props.selectPaymentId(value);
  }

  openCardModal () {
    this.setState({ cardModalOpen: true });
  }

  closeCardModal () {
    this.setState({ cardModalOpen: false });
  }

  createCard () {
    console.log('create card')
    var self = this;
    axios.post('http://127.0.0.1:3030/cards', {
      name: self.state.name,
      exp_month: self.state.month,
      exp_year: self.state.year,
      number: self.state.number,
      last4: self.state.number.slice(Math.max(self.state.number.length - 4, 1)),
      cvc: self.state.code        
    },
    { 
      auth: { username: 'pk_test_70c1ed396063416a8b972545af620d5e' }
    })
    .then(function (response) {
      // location.reload()
      console.log(response);
      self.closeCardModal()
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  render() {
    const { cards, name, number, code } = this.state

    var months = [1,2,3,4,5,6,7,8,9,10,11,12].map(number => ({text: number, value: number}))
    var years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(number => ({text: number, value: number}))

    return (
      <div>
        <Segment>
          <Label attached='top'>Pay with</Label>
          <Radio
            label='Cash on delivery'
            name='paymentRadioGroup'
            value='Cash on delivery'
            checked={this.props.selectedPaymentId === 'Cash on delivery'}
            onChange={this.handlePaymentChange.bind(this)}
          />
        </Segment>

        <Modal size='mini' open={this.state.cardModalOpen} onClose={this.closeCardModal.bind(this)}>
          <Modal.Header>
            Create new card
          </Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.createCard.bind(this)}>
              <Form.Field>
                <label>Name (as it appears on card)</label>
                <Input placeholder='Name' name='name' value={name} onChange={this.handleChange.bind(this)} />
              </Form.Field>
              <Form.Field>
                <label>Card number</label>
                <Input placeholder='Card number' name='number' value={number} onChange={this.handleChange.bind(this)} />
              </Form.Field>
              <Form.Field>
                <label>Expiration date</label>
                <Form.Dropdown inline selection options={months} name='month' onChange={this.handleChange.bind(this)} />
                <Form.Dropdown inline selection options={years} name='year' onChange={this.handleChange.bind(this)} />
              </Form.Field>
              <Form.Field>
                <label>Security code</label>
                <Input placeholder='Security code' name='code' value={code} onChange={this.handleChange.bind(this)} />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color='grey' onClick={this.closeCardModal.bind(this)}>
              Cancel
            </Button>
            <Button color='blue' content='Create Card' onClick={this.createCard.bind(this)} />
          </Modal.Actions>
        </Modal>
      </div>
    );   
  }
}


export default Payment
