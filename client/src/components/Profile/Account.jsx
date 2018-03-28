import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Sticky, Rail, Loader, Dimmer, Table, Button, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, TextArea } from 'semantic-ui-react'
import axios from 'axios';
// import moment from 'moment-timezone';


export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopupOpen: false,
      loading: false,
      fullName: '',
      email: '',
      mobile: '',
      nationality: '',
      gender: '',
      dateOfBirth: ''
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
      const { fullName, email, mobile, nationality, gender, dateOfBirth  } = response.data;     
      self.setState({
        fullName: fullName,
        email: email,
        mobile: mobile ? mobile.substr(4) : '',
        nationality: nationality || '',
        gender: gender || '',
        dateOfBirth: dateOfBirth ? moment(dateOfBirth).format('YYYY-MM-DD') : '',
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
    const { id, fullName, email, mobile, nationality, gender, dateOfBirth } = this.state
    var self = this;
    this.setState({loading: true});

    if (this.checkFields()) {
      axios.post('/api/accounts', {
        fullName: fullName,
        email: email,
        mobile: '+971'+mobile,
        nationality: nationality,
        gender: gender.length === 0 ? null : gender,
        dateOfBirth: dateOfBirth.length === 0 ? null : dateOfBirth
      })
      .then(response => {
        self.setState({loading: false})
        self.getAccount();
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

    var fields = ['fullName', 'email', 'mobile']
    var value = {
      fullName: 'full name',
      email: 'email',
      mobile: 'mobile',
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
    const { loading, fullName, email, mobile, nationality, gender, dateOfBirth } = this.state
    const { fullNameError, fullNameErrorMessage, emailError, emailErrorMessage, mobileError, mobileErrorMessage } = this.state


    return (
      <Segment id='account'>
        <Header as='h3'>Account</Header>
        <Form>
          <Grid>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Input error={fullNameError} label={'Full Name*' + (fullNameError ? ' - '+fullNameErrorMessage : '')} placeholder='Full Name' value={fullName} name='fullName' onChange={this.handleChange.bind(this)} />
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Input error={emailError} label={'Email*' + (emailError ? ' - '+emailErrorMessage : '')} placeholder='Email' type='email' value={email} name='email' onChange={this.handleChange.bind(this)} />
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Field error={mobileError}>
                <label>{'Mobile Number*' + (mobileError ? ' - '+mobileErrorMessage : '')}</label>
                <Input fluid label='+971' labelPosition='left' placeholder='Mobile Number' name='mobile' value={mobile} onChange={this.handleChange.bind(this)}/>                
              </Form.Field>
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Dropdown
                label='Nationality'
                onChange={this.handleChange.bind(this)}
                options={countries.map(option => ({ key: option, text: option, value: option }))}
                placeholder='Select a country'
                selection
                search
                name='nationality'
                value={nationality}
              />
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Input label='Date of birth' placeholder='Date of birth' type='date' value={dateOfBirth} name='dateOfBirth' onChange={this.handleChange.bind(this)} />
            </Grid.Column>
            <Grid.Column mobile={16} tablet={8} computer={8}>
              <Form.Dropdown
                label='Gender'
                onChange={this.handleChange.bind(this)}
                options={['male', 'female'].map(option => ({ key: option, text: option, value: option }))}
                placeholder='Select a gender'
                selection
                name='gender'
                value={gender}
              />
            </Grid.Column>
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

var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

