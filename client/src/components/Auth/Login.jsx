import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Segment, Dimmer, Loader, Header, Icon, Button, Form, Message, Grid } from 'semantic-ui-react'
import axios from 'axios';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      visible: false,
      loading: false
    }
  }

  login () {
    var self = this;
    const { email, password } = this.state;
    this.setState({loading: true});

    axios.post('/api/accounts/login', {
      email: email,
      password: password
    })
    .then(response => {
      if (response.data.authenticated) {
        window.location.href = '/';
      } else {
        self.setState({ visible: true, loading: false })
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  render() {
    const { email, password, visible, loading } = this.state;
    return (
      <Grid centered>  
        <Grid.Column mobile={16} tablet={6} computer={6}>
          <Segment>
            <Header as='h2' icon textAlign='center'>
              <Icon name='user' circular />
              <Header.Content>
                Login
              </Header.Content>
            </Header>
            <Form onSubmit={this.login.bind(this)}>
              <Message negative visible={visible} hidden={!visible}>
                <Message.Header>Login error</Message.Header>
                <p>The username and password you entered did not match our records. Please double-check and try again.</p>
              </Message>
              <Form.Input placeholder='Email' type='email' value={email} name='email' onChange={this.handleChange.bind(this)} />
              <Form.Input placeholder='Password' type='password' value={password} name='password' onChange={this.handleChange.bind(this)} />
              <Button fluid type='submit' primary>Sign in</Button>
            </Form>
            <Segment textAlign='left' basic compact>
              Don't have an account? <Link to='/signup'>register here</Link>
            </Segment>
            <Dimmer inverted active={loading}>
              <Loader />
            </Dimmer>
          </Segment>
        </Grid.Column>
      </Grid>
    );      
  }
}


