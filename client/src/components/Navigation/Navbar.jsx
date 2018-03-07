import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Sidebar, Segment, Button, Divider, Menu, List, Icon, Popup, Input, Form, Dropdown, Message, Card, Image, Grid, Loader, Header } from 'semantic-ui-react'
import axios from 'axios';


class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: 0,
      visible: false,
      search: ''
    }
  }

  signOut () {
    axios.get('/api/accounts/signout').then(() => {
      window.location.href = '/';
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  search () {
    if (this.state.search.length > 0) {
      this.props.history.push('/?search='+this.state.search.split(' ').join('+'))      
    }
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  openPopup () { this.setState({ visible: true }) }
  closePopup () { this.setState({ visible: false }) }


  render() {
    const { visible, search } = this.state;
    const { isLoggedIn } = this.props;


    return (
      <div style={{height: '100%'}}>
        <Menu borderless pointing style={{borderRadius: 0, top: 0, position: 'fixed', width: '100%', zIndex: '10'}}>
          <Menu.Item as={Link} to='/'>
            <Header as='h1'>Vendlor</Header>
          </Menu.Item>

          {mobilecheck ? (
            <div/>
          ) : (
            <Menu.Item>
              <Form onSubmit={this.search.bind(this)}>
                <Form.Input style={{width: '30vw'}} icon='search' placeholder='Search...' name='search' value={search} onChange={this.handleChange.bind(this)} />
              </Form>
            </Menu.Item>
          )}

          {mobilecheck ? (
            <Menu.Menu position='right'>
              <Menu.Item>
                <Popup
                  trigger={<Icon name='sidebar' size='large' onClick={this.openPopup.bind(this)} />}
                  flowing
                  hoverable
                  position='bottom right'
                  style={{margin: '10px', left: 0, top: 0, right: 0}}
                  on='click'
                  basic
                  open={visible}
                >
                  {isLoggedIn ? (
                    <div>
                      <Segment basic style={{textAlign: 'right', padding: 0}}>
                        <Icon name='close' size='large' onClick={this.closePopup.bind(this)} />
                      </Segment>
                      <Form onSubmit={this.search.bind(this)}>
                        <Form.Input icon='search' placeholder='Search...' name='search' value={search} onChange={this.handleChange.bind(this)} />
                      </Form>

                      <List selection verticalAlign='middle'>
                        {items.map((item, index) => (
                          <List.Item as={Link} to={item.path} key={index}>
                            <Icon name={item.icon} size='large' />
                            <List.Content>
                              <List.Header>{item.title}</List.Header>
                            </List.Content>
                          </List.Item>
                        ))}
                        <List.Item onClick={this.signOut.bind(this)}>
                          <Icon name='sign out' size='large' />
                          <List.Content>
                            <List.Header>Sign out</List.Header>
                          </List.Content>
                        </List.Item>
                      </List>
                    </div>
                  ) : (
                    <div>
                      <Segment basic style={{textAlign: 'right', padding: 0}}>
                        <Icon name='close' size='large' onClick={this.closePopup.bind(this)} />
                      </Segment>
                      <Form onSubmit={this.search.bind(this)}>
                        <Form.Input icon='search' placeholder='Search...' name='search' value={search} onChange={this.handleChange.bind(this)} />
                      </Form>
                      <Divider horizontal/>
                      <Button.Group widths={6}>
                        <Button primary as={Link} to='/login'>Login</Button>
                        <Button.Or />
                        <Button as={Link} to='/signup'>Sign up</Button>
                      </Button.Group>
                    </div>
                  )}
                </Popup>
              </Menu.Item>
            </Menu.Menu>
          ) : (
            <Menu.Menu position='right'>
              <Menu.Item as={Link} to='/'><Icon name='home' size='large' /></Menu.Item>
              <Popup
                trigger={<Menu.Item><Icon name='unordered list' size='large' /></Menu.Item>}
                flowing
                hoverable
                position='bottom right'
                style={{/*margin: '10px', left: 0, top: 0*/ padding: '5px 20px'}}
                on='click'
              >
                <Popup.Header style={{margin: '5px 0'}}>Categories</Popup.Header>
                <Grid centered divided columns={2}>
                  <Grid.Column>
                    <List relaxed selection>
                      {categories.slice(0,12).map((category, index) => (
                        <List.Item style={{color: 'black'}} as={Link} to={'/?category='+category.split(' ').join('+')} key={index}>
                          {category}
                        </List.Item>
                      ))}
                    </List>
                  </Grid.Column>
                  <Grid.Column >
                    <List relaxed selection>
                      {categories.slice(12,23).map((category, index) => (
                        <List.Item style={{color: 'black'}} as={Link} to={'/?category='+category.split(' ').join('+')} key={index}>
                          {category}
                        </List.Item>
                      ))}
                    </List>
                  </Grid.Column>
                </Grid>
              </Popup>
              {isLoggedIn ? (
                <Menu.Item style={{padding: 0}}>
                  {/*items.map((item, index) => (
                    <Menu.Item style={{height: '100%'}} as={Link} to={item.path} key={index}>
                      <Icon name={item.icon} size='large' />
                    </Menu.Item>
                  ))*/}
                  <Menu.Item style={{height: '100%'}} as={Link} to='/cart'>
                    <Icon name='cart' size='large' />
                  </Menu.Item>
                  <Menu.Item style={{height: '100%'}} as={Link} to='/track'>
                    <Icon name='truck' size='large' />
                  </Menu.Item>
                  {/*<Menu.Item onClick={this.signOut.bind(this)}>
                    <Icon name='sign out' size='large' />
                  </Menu.Item>*/}
                    <Dropdown pointing='top right' style={{height: '100%'}} item icon={<Icon name='user circle outline' size='large' />}>
                      <Dropdown.Menu>
                        <Dropdown.Item text='Profile' as={Link} to='/profile' />
                        <Dropdown.Item text='Inventory' as={Link} to='/inventory' />
                        <Dropdown.Item text='Sign Out' onClick={this.signOut.bind(this)} />
                      </Dropdown.Menu>
                    </Dropdown>
                  <Menu.Item/>
                </Menu.Item>
              ) : (
                <Menu.Item style={{padding: 0}}>
                  <Menu.Item>
                    <Button primary as={Link} to='/login'>Login</Button>
                  </Menu.Item>
                  <Menu.Item>
                    <Button as={Link} to='/signup'>Sign up</Button>
                  </Menu.Item>
                  <Menu.Item/>
                </Menu.Item>
              )}
            </Menu.Menu>
          )}
        </Menu>
        <div style={{padding: '100px 20px'}}>
          {this.props.children}          
        </div>
      </div>
    )
  }
}

export default withRouter(Navbar)

var items = [
  { path: '/', icon: 'home', title: 'Home' },
  { path: '/cart', icon: 'cart', title: 'Cart' },
  { path: '/track', icon: 'truck', title: 'Track' },
  { path: '/inventory', icon: 'cubes', title: 'Inventory' },
  { path: '/profile', icon: 'user circle outline', title: 'Profile' },
]

var categories = [
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
  'Stuff Wanted',
  'Tickets and Vouchers',
  'Toys',
]
