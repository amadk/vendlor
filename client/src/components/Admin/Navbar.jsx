import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Input, Icon, Dropdown, Header, Label, Form, Popup } from 'semantic-ui-react'
import axios from 'axios';


export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productLink: '',
      loading: false,
      category: '',
      weight: ''
    }
  }

  signOut () {
    axios.get('/api/accounts/signout').then(() => {
      location.reload();
    })
  }

  changeMode () {
    axios.get('/api/auth/changemode').then(() => {
      window.location.href = '/';
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  addProduct () {
    var self = this;
    this.setState({loading: true});

    if (this.checkFields()) {
      axios.post('/api/admin/addproduct', {
        productLink: self.state.productLink,
        category: self.state.category,
        weight: self.state.weight
      })
      .then(response => {
        self.setState({ 
          productLink: '',
          weight: '',
          category: '',
          loading: false 
        })
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {
      self.setState({ 
        loading: false 
      })
    }

  }

  checkFields () {
    var self = this
    var checkPass = true;

    var fields = ['productLink', 'weight', 'category']

    fields.forEach(field => {
      if (self.state[field].length === 0) {
        checkPass = false;
        var obj = {};
        obj[field+'Error'] = true;
        obj[field+'ErrorMessage'] = 'Please enter a '+field
        this.setState(obj)
      } else if ((field === 'weight') && isNaN(self.state[field])) {
        checkPass = false;
        var obj = {};
        obj[field+'Error'] = true;
        obj[field+'ErrorMessage'] = 'This field must be a number'
        this.setState(obj)
      } else if (field === 'weight' && self.state[field] > 30000) {
        checkPass = false;
        var obj = {};
        obj[field+'Error'] = true;
        obj[field+'ErrorMessage'] = 'Maxiumum weight allowed is 30,000 grams'
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
    const { loading, productLink, weight, category, weightError, weightErrorMessage, categoryError, categoryErrorMessage } = this.state;

    return (
      <div>
        <Menu borderless pointing style={{borderRadius: 0}}>
          <Menu.Item as={Link} to='/'>
            <Header as='h1'>Vendlor</Header>
          </Menu.Item>
            { mobilecheck ? (
              <Menu.Menu position='right'>
                <Popup
                  trigger={<Menu.Item icon='add' size='large' />}
                  on='click'
                >
                  <Popup.Header content='Add Product' />
                  <Form onSubmit={this.addProduct.bind(this)}>
                    <Form.Input
                      name='productLink'
                      value={productLink}
                      onChange={this.handleChange.bind(this)}
                      loading={loading}
                      placeholder='Product link...'
                    />
                    <Form.Dropdown
                      error={categoryError}
                      label={'Category*' + (categoryError ? ' - '+categoryErrorMessage : '')}
                      onChange={this.handleChange.bind(this)}
                      options={categoryOptions.map(option => ({ key: option, text: option, value: option }))}
                      placeholder='Select a category'
                      selection
                      search
                      name='category'
                      value={category}
                    />
                    <Form.Field error={weightError}>
                      <label>{'Approximate weight*' + (weightError ? ' - '+weightErrorMessage : '')}</label>
                      <Input label='grams' labelPosition='right' placeholder='Weight' value={weight} name='weight' onChange={this.handleChange.bind(this)} />
                    </Form.Field>
                    <Button floated='right' loading={loading}>Add Product</Button>
                  </Form>

                </Popup>
                <Menu.Item>
                  <Dropdown icon={<Icon name='user circle outline' size='big' />} position='right' pointing='top right'>
                    <Dropdown.Menu>
                      {/*<Dropdown.Item text='Sellers' as={Link} to='/sellers' />*/}
                      <Dropdown.Item text='Products' as={Link} to='/products' />
                      <Dropdown.Item text='Shipments' as={Link} to='/shipments/intransit' />
                      <Dropdown.Item text='Payouts' as={Link} to='/payouts' />
                      <Dropdown.Item text='Bank Accounts' as={Link} to='/bankAccounts' />
                      <Dropdown.Item text='User Mode' onClick={this.changeMode.bind(this)} />
                      <Dropdown.Item text='Sign Out' onClick={this.signOut.bind(this)} />
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu.Item>
              </Menu.Menu>
              ) : (
              <Menu.Menu position='right'>
                <Popup
                  trigger={<Menu.Item icon='add' size='large' />}
                  on='click'
                >
                  <Popup.Header content='Add Product' />
                  <Form onSubmit={this.addProduct.bind(this)}>
                    <Form.Input
                      name='productLink'
                      value={productLink}
                      onChange={this.handleChange.bind(this)}
                      loading={loading}
                      placeholder='Product link...'
                      style={{width: '400px'}}
                    />
                    <Form.Dropdown
                      error={categoryError}
                      label={'Category*' + (categoryError ? ' - '+categoryErrorMessage : '')}
                      onChange={this.handleChange.bind(this)}
                      options={categoryOptions.map(option => ({ key: option, text: option, value: option }))}
                      placeholder='Select a category'
                      selection
                      search
                      name='category'
                      value={category}
                    />
                    <Form.Field error={weightError}>
                      <label>{'Approximate weight*' + (weightError ? ' - '+weightErrorMessage : '')}</label>
                      <Input label='grams' labelPosition='right' placeholder='Weight' value={weight} name='weight' onChange={this.handleChange.bind(this)} />
                    </Form.Field>
                    <Button>Add Product</Button>
                  </Form>
                </Popup>

                <Menu.Item name='Products' as={Link} to='/products' />
                <Menu.Item name='Sellers' as={Link} to='/sellers' />
                <Menu.Item name='Shipments' as={Link} to='/shipments/intransit' />
                <Menu.Item name='Payouts' as={Link} to='/payouts' />
                <Menu.Item name='Bank Accounts' as={Link} to='/bankAccounts' />
                <Menu.Item name='User Mode' onClick={this.changeMode.bind(this)} />
                <Menu.Item name='Sign Out' onClick={this.signOut.bind(this)} />
              </Menu.Menu>              
              ) }
        </Menu>
        <div style={{margin: '15px 20px'}}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

var categoryOptions = [
  'Baby Items', 
  'Books',
  'Business and Industrial', 
  'Cameras and Imaging',
  'Clothing and Accessories',
  'Collectibles',
  'Computers and Networking',
  'DVDs and Movies',
  'Electronics',
  'Free Stuff',
  'Furniture, Home and Garden',
  'Gaming',
  'Home Appliances',
  'Jewelry and Watches',
  'Lost/Found',
  'Misc',
  'Mobile Phones and PDAs',
  'Music',
  'Musical Instruments',
  'Pets',
  'Sports Equipment',
  'Tickets and Vouchers',
  'Toys',
]





