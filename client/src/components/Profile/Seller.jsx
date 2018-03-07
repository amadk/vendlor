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
      sellerType: ''
    }
  }

  componentDidMount () {
    this.getAccount();
  }

  getAccount () {
    var self = this;
    this.setState({loading: true});

    axios.get('/api/accounts')
    .then(response => {
      const { sellerType, availableBalance, pendingBalance } = response.data;     
      self.setState({
        sellerType: sellerType || '',
        availableBalance: availableBalance,
        pendingBalance: pendingBalance,
        loading: false
      })
      // Object.keys(response.data).forEach(key => {
      //   response.data[key] = response.data[key] === null ? '' : response.data[key]
      // })
      // self.setState(response.data)
      // self.setState({ loading: false })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  save () {
    const { sellerType } = this.state
    var self = this;
    this.setState({loading: true});

    if (this.checkFields()) {
      axios.post('/api/accounts', {
        sellerType: sellerType,
      })
      .then(response => {
        self.setState({loading: false})
        self.getAccount()
        self.openPopup(response.data);
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
    var checkPass = true;

    var fields = ['sellerType']
    var value = {
      sellerType: 'seller type',
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
    const { loading, sellerType, status, rating, availableBalance, pendingBalance } = this.state
    const { sellerTypeError, sellerTypeErrorMessage, emailError, emailErrorMessage, mobileError, mobileErrorMessage } = this.state


    return (
      <Segment id='seller'>
        <Header as='h3'>Seller</Header>
        <Form>
          <Grid>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Header as='h4'>Available Balance: {availableBalance} AED</Header>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Header as='h4'>Pending Balance: {pendingBalance} AED</Header>
            </Grid.Column>
            {/*<Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Dropdown
                label={'Seller type' + (sellerTypeError ?  ' - '+sellerTypeErrorMessage : '')}
                error={sellerTypeError}
                onChange={this.handleChange.bind(this)}
                options={['individual', 'business'].map(option => ({ key: option, text: option, value: option }))}
                placeholder='Select a seller type'
                selection
                name='sellerType'
                value={sellerType}
              />
            </Grid.Column>*/}
          </Grid>
        </Form>
        <Divider />
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
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
      </Segment>
    );
  }
}
