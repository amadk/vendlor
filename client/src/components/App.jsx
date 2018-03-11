import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  Switch
} from 'react-router-dom';

import axios from 'axios';

import Navbar from './Navigation/Navbar.jsx';
import Home from './Home/Home.jsx';
import Product from './Product/Product.jsx';
import Login from './Auth/Login.jsx';
import Signup from './Auth/Signup.jsx';

import Inventory from './Inventory/Inventory.jsx';
import AddProduct from './Product/AddProduct.jsx';
import Cart from './Cart/Cart.jsx';

import Track from './Track/Track.jsx'
import Return from './Track/Return.jsx'
import Profile from './Profile/Profile.jsx'

import AdminNav from './Admin/Navbar.jsx'
import Admin from './Admin/Admin.jsx'
import Shipment from './Admin/Shipment.jsx'


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authChecked: false,
      isLoggedIn: false
    }
  }

  componentDidMount () {
    var self = this;
    axios.get('/api/auth/isloggedin')
    .then(response => {
      self.setState({
        token: response.data.token,
        authChecked: true,
        isLoggedIn: response.data.isLoggedIn,
        userType: response.data.userType
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }


  render() {
    const { authChecked, isLoggedIn, userType } = this.state;
      // return (<div></div>)

    if (authChecked) {
      if (isLoggedIn) {
        if (userType === 'user') {
          return (
            <Navbar isLoggedIn={isLoggedIn}>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/inventory" component={Inventory} />
                <Route exact path="/products/:productId" render={props => (<Product {...props} isLoggedIn={isLoggedIn} />)} />
                <Route exact path="/editproduct/:productId" component={AddProduct} />
                <Route exact path="/addproduct" component={AddProduct} />
                <Route exact path="/cart" component={Cart} />
                <Route exact path="/track" component={Track} />
                <Route exact path="/return" component={Return} />
                <Route exact path="/profile" component={Profile} />
              </Switch>
            </Navbar>
          )
        } 
        else if (userType === 'admin') {
          return (
            <AdminNav>
              <Switch>
                <Route exact path="/shipments/:status" component={Shipment} />
                <Route exact path="/:items" component={Admin} />
                {/*<Route exact path="/bank_accounts" component={BankAccount} />
                <Route exact path="/payouts" component={Payout} />
                <Route exact path="/shipments" component={Shipment} />*/}
              </Switch>
            </AdminNav>
          )
        }
      } else {
        return (
          <Navbar isLoggedIn={isLoggedIn}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/products/:productId" render={props => (<Product {...props} isLoggedIn={isLoggedIn} />)} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
            </Switch>
          </Navbar>
        )
      }      
    } else {
      return (<div></div>)
    }

  }
}
