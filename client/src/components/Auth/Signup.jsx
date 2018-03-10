import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Segment, Header, Icon, Button, Form, Grid, Loader, Input, Message } from 'semantic-ui-react'
import axios from 'axios';

export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      email: '',
      mobile: '',
      password: '',

      nameError: false,
      emailError: false,
      mobileError: false,
      passwordError: false,

      nameErrorMessage: '',
      emailErrorMessage: '',
      mobileErrorMessage: '',
      passwordErrorMessage: '',

      visible: false,
      errorMessage: ''
    }
  }

  componentDidMount () {

  }

  signup () {
    var self = this;
    const { fullName, email, mobile, password } = this.state;

    var checksPassed = true;

    if (fullName.length === 0) { 
      checksPassed = false;
      this.setState({
        nameError: true,
        nameErrorMessage: 'Please enter your full name'
      })
    } else {
      this.setState({
        nameError: false,
        nameErrorMessage: ''
      })
    }

    if (email.length === 0) {
      checksPassed = false;
      this.setState({
        emailError: true,
        emailErrorMessage: 'Please enter your email'
      })
    } else if (!validateEmail(email)) {
      this.setState({
        emailError: true,
        emailErrorMessage: 'Email is not valid'
      })
    } else {
      this.setState({
        emailError: false,
        emailErrorMessage: ''
      })
    }

    if (password.length === 0) {
      checksPassed = false;
      this.setState({
        passwordError: true,
        passwordErrorMessage: 'Please enter a password'
      })
    } else if (password.length <= 8) {
      checksPassed = false;
      this.setState({
        passwordError: true,
        passwordErrorMessage: 'Password is less than 8 characters'
      })
    } else if (password === password.toUpperCase()) {
      checksPassed = false;
      this.setState({
        passwordError: true,
        passwordErrorMessage: 'Password is missing a lowercase character'
      })
    } else if (password === password.toLowerCase()) {
      checksPassed = false;
      this.setState({
        passwordError: true,
        passwordErrorMessage: 'Password is missing a uppercase character'
      })
    } else if (!/\d/.test(password)) {
      checksPassed = false;
      this.setState({
        passwordError: true,
        passwordErrorMessage: 'Password is missing a number (0-9)'
      })
    } else if (!(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))) {
      checksPassed = false;
      this.setState({
        passwordError: true,
        passwordErrorMessage: 'Password is missing a special character'
      })
    } else {
      this.setState({
        passwordError: false,
        passwordErrorMessage: ''
      })
    }

    if (mobile.length === 0) { 
      checksPassed = false;
      this.setState({
        mobileError: true,
        mobileErrorMessage: 'Please enter your mobile number'
      })
    } else if (isNaN(mobile)) {
      checksPassed = false;
      this.setState({
        mobileError: true,
        mobileErrorMessage: 'Mobile number should only contain numbers'
      })
    } else if (mobile.length !== 9) {
      checksPassed = false;
      this.setState({
        mobileError: true,
        mobileErrorMessage: 'Mobile number should be 9 digits, e.g 50123456'
      })
    } else {
      this.setState({
        mobileError: false,
        mobileErrorMessage: ''
      })
    }

    if (checksPassed) {
      axios.post('/api/accounts/signup', {
        fullName: fullName,
        email: email,
        mobile: '+971'+mobile,
        password: password
      })
      .then(response => {
        if (response.data.authenticated) {
          window.location.href = '/';
        } else {
          self.setState({
            visible: true,
            errorMessage: response.data.serverMessage
          })
        } 
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  render() {
    const { visible, errorMessage, fullName, email, mobile, password, nameError, nameErrorMessage, passwordError, passwordErrorMessage, mobileError, mobileErrorMessage, emailError, emailErrorMessage } = this.state;

    return (
      <Grid centered>
        <Grid.Column mobile={16} tablet={6} computer={6}>
          <Segment>
            <Header as='h2' icon textAlign='center'>
              <Icon name='user' circular />
              <Header.Content>
                Sign up
              </Header.Content>
            </Header>
            <Form onSubmit={this.signup.bind(this)}>

              <Message negative visible={visible} hidden={!visible}>
                <Message.Header>Sign up error</Message.Header>
                <p>{errorMessage}</p>
              </Message>

              <div style={{color: '#e0245d'}}>{nameErrorMessage}</div>
              <Form.Input error={nameError} placeholder='Full Name' value={fullName} name='fullName' onChange={this.handleChange.bind(this)} />

              <div style={{color: '#e0245d'}}>{emailErrorMessage}</div>
              <Form.Input error={emailError} placeholder='Email' type='email' value={email} name='email' onChange={this.handleChange.bind(this)} />
              
              <div style={{color: '#e0245d'}}>{passwordErrorMessage}</div>
              <Form.Input error={passwordError} placeholder='Password' type='password' value={password} name='password' onChange={this.handleChange.bind(this)} />
              
              <div style={{color: '#e0245d'}}>{mobileErrorMessage}</div>
              <Form.Field error={mobileError}>
                <Input fluid label='+971' labelPosition='left' placeholder='Mobile Number' name='mobile' value={mobile} onChange={this.handleChange.bind(this)}/>                
              </Form.Field>
              
              <Button fluid type='submit' primary>Sign up</Button>
            </Form>
            <Segment textAlign='left' basic compact>
              Already have an account? <Link to='/login'>login here</Link>
            </Segment>
          </Segment>
        </Grid.Column>
      </Grid>
    );      
  }
}

var validateEmail = function (email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}



