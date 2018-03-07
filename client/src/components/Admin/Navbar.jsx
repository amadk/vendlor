import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu, Input, Icon, Dropdown, Header, Label } from 'semantic-ui-react'
import axios from 'axios';


export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  signOut () {
    axios.get('/api/accounts/signout').then(() => {
      location.reload();
    })
  }

  render() {
    return (
      <div>
        <Menu borderless pointing stackable style={{borderRadius: 0}}>
          <Menu.Item as={Link} to='/'>
            <Header as='h1'>Vendlor</Header>
          </Menu.Item>
          <Menu.Menu position='right'>
            {<Menu.Item name='Sellers' as={Link} to='/sellers' />}
            <Menu.Item name='Products' as={Link} to='/products' />
            <Menu.Item name='Shipments' as={Link} to='/shipments/intransit' />
            <Menu.Item name='Payouts' as={Link} to='/payouts' />
            <Menu.Item name='Bank Accounts' as={Link} to='/bankAccounts' />
            <Menu.Item name='Sign Out' onClick={this.signOut.bind(this)} />

            <Menu.Item>
              <Dropdown icon={<Icon name='user circle outline' size='big' />} position='right' pointing='top right'>
                <Dropdown.Menu>
                  {/*<Dropdown.Item text='Sellers' as={Link} to='/sellers' />*/}
                  <Dropdown.Item text='Products' as={Link} to='/products' />
                  <Dropdown.Item text='Shipments' as={Link} to='/shipments' />
                  <Dropdown.Item text='Payouts' as={Link} to='/payouts' />
                  <Dropdown.Item text='Bank Accounts' as={Link} to='/bankAccounts' />
                  <Dropdown.Item text='Sign Out' onClick={this.signOut.bind(this)} />
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <div style={{margin: '15px 20px'}}>
          {this.props.children}
        </div>
      </div>
    )
  }
}