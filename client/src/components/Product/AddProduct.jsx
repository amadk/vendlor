import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Segment, Loader, Message, Dimmer, Table, Button, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, TextArea } from 'semantic-ui-react'
import axios from 'axios';
import superagent from 'superagent';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import Dropzone from 'react-dropzone';
import Address from '../Cart/Address.jsx';
import AddressForm from '../Cart/AddressForm.jsx';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

class AddProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slideIndex: 0,
      quantityInput: 1,
      popupContent: '',
      isPopupOpen: false,
      photosLength: 0,
      photosToBeRemoved: [],
      loading: false,
      category: '',
      condition: '',
      size: '',
      weight: '',
      age: '',
      usage: '',
      warranty: '',
      addressForm: false,
      addressToEdit: {},

      title: '',
      quantity: '',
      price: '',
      description: '',
      photos: [],
      newPhotos: []
    }
  }

  componentDidMount () {
    var self = this;
    this.getProducts(() => {
      self.getProductPhotos()
    })
  }

  getProducts (callback) {
    var self = this;
    var productId = this.props.match.params.productId;

    if (productId) {
      axios.get('/api/products/'+productId)
      .then(response => {
        self.setState(response.data)
        self.setState({
          selectedAddressId: response.data.pickupAddressId
        })
        callback();
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  getProductPhotos () {
    var self = this;
    var productId = this.props.match.params.productId

    axios.get('/api/products/'+productId+'/photos')
    .then(response => {
      self.setState({
        photos: response.data.map(photo => ('https://s3.ap-south-1.amazonaws.com/vendlor/'+photo.key)),
        photosLength: response.data.length
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleSlideChange (value) {
    this.setState({
      slideIndex: value,
    });
  };

  handleChange (e, { name, value }) { this.setState({ [name]: value }) }

  nextPhoto () {
    if (this.state.photosLength > 0) {
      this.setState({
        slideIndex: this.state.slideIndex === this.state.photosLength-1 ? 0 : this.state.slideIndex+1
      })
    }
  }

  previousPhoto () {
    if (this.state.photosLength > 0) {
      this.setState({
        slideIndex: this.state.slideIndex === 0 ? this.state.photosLength-1 : this.state.slideIndex-1
      })      
    }
  }

  save () {
    var self = this;
    if (this.checkFields()) {
      this.saveProductInformation((newProductId) => {
        self.removePhotosFromCloud(() => {
          self.uploadPhotos(newProductId);
        });
      });      
    }
  }

  checkFields () {
    var self = this
    var checkPass = true;

    var fields = ['title', 'price', 'condition', 'category', 'quantity', 'weight', 'description', 'age', 'usage', 'warranty']

    fields.forEach(field => {
      if (self.state[field].length === 0) {
        checkPass = false;
        var obj = {};
        obj[field+'Error'] = true;
        obj[field+'ErrorMessage'] = 'Please enter a '+field
        this.setState(obj)
      } else if ((field === 'price' || field === 'quantity' || field === 'weight') && isNaN(self.state[field])) {
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

    if (this.state.photosLength === 0) {
      checkPass = false;
      this.setState({
        photoError: true,
        photoErrorMessage: 'Please add at least one photo of your product'
      })
    } else {
      this.setState({
        photoError: false,
        photoErrorMessage: ''
      })
    }

    if (!this.state.selectedAddressId) {
      checkPass = false;
      this.setState({
        addressError: true,
        addressErrorMessage: 'Please select an address'
      })
    } else {
      this.setState({
        addressError: false,
        addressErrorMessage: ''
      })
    }

    return checkPass

  }

  saveProductInformation (callback) {
    var self = this;
    const { id, title, weight, quantity, price, category, condition, description, selectedAddressId, age, warranty, usage } = this.state
    var productId = this.props.match.params.productId;

    axios.post('/api/products/'+(productId ? productId : ''), {
      title: title,
      quantity: quantity,
      price: price,
      category: category,
      age: age,
      warranty: warranty,
      usage: usage,
      weight: weight,
      condition: condition,
      description: description,
      pickupAddressId: selectedAddressId,
      live: true
    })
    .then(response => {
      self.setState({loading: true})
      callback(response.data.id);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  uploadPhotos (newProductId) {
    var self = this;
    const { photos, newPhotos, photosLength } = this.state

    if (newPhotos.length > 0) {
      var productId = this.props.match.params.productId || newProductId;

      var req = superagent.post('/api/products/'+newProductId+'/photos');
      var uploadData = {
        newPhotos: newPhotos
      }
      Object.keys(uploadData).forEach(function(key) {
        req.field(key, uploadData[key]);
      });

      req.end((err, res) => {
        if (err) console.log(err);
        self.openPopup('Product saved successfully');
        self.setState({loading: false})
        window.location.href = '/editproduct/'+newProductId;
      });
    } else {
      self.openPopup('Product saved successfully');
      self.setState({loading: false});       

    }
  }

  removePhotosFromCloud (callback) {
    var self = this;
    const { id, photosToBeRemoved } = this.state;

    if (photosToBeRemoved.length > 0 && this.props.match.params.productId) {
      axios.post('/api/products/'+id+'/photos/delete', {
        photos: photosToBeRemoved
      })
      .then(response => {
        callback()
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {
      callback()
    }
  }

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

  onDrop (newPhotos) {
    if (this.state.photosLength < 6) {
      newPhotos = newPhotos.slice(0,(6-this.state.photosLength));
      this.setState({
        newPhotos: this.state.newPhotos.concat(newPhotos),
        photosLength: newPhotos.length + this.state.photosLength
      });      
    }
  }

  removePhoto (e, { value }) {
    var self = this;
    if (this.state.photosLength > 0) {
      var photos = this.state.photos.concat(this.state.newPhotos);
      var photoToBeRemoved = photos.splice(value, 1)[0];

      this.setState({
        photosLength: photos.length,
        photos: photos.filter(photo=>!photo.preview),
        newPhotos: photos.filter(photo=>photo.preview),
        slideIndex: 0
      });

      if (!photoToBeRemoved.preview) {
        var photosToBeRemoved = self.state.photosToBeRemoved;
        photosToBeRemoved.push(photoToBeRemoved.split('/').reverse()[0]);

        this.setState({
          photosToBeRemoved: photosToBeRemoved
        })
      }
    }
  }

  getAddresses () {}

  openAddressForm (address) { 
    this.setState({ 
      addressToEdit: address || {},
      addressForm: true 
    }) 
  }

  closeAddressForm () { this.setState({ addressForm: false }) }
 
  render() {
    const { age, usage, warranty, weight, addressToEdit, addressForm, slideIndex, selectedAddressId, loading, id, title, quantity, price, photos, newPhotos, description, quantityInput, photosLength, category, condition, size } = this.state
    const { ageError, ageErrorMessage, usageError, usageErrorMessage, warrantyError, warrantyErrorMessage, weightError, weightErrorMessage, addressError, addressErrorMessage, photoError, photoErrorMessage, titleError, titleErrorMessage, priceError, priceErrorMessage, categoryError, categoryErrorMessage, conditionError, conditionErrorMessage, sizeError, sizeErrorMessage, quantityError, quantityErrorMessage, descriptionError, descriptionErrorMessage } = this.state
    

    var quantityArr = [];
    for (var i = 1; i < quantity+1; i++) {
      quantityArr.push({ key: i, text: i, value: i })
    }
    var self = this;
    let dropzoneRef;

    if (addressForm) { return (<AddressForm addressToEdit={addressToEdit} closeAddressForm={this.closeAddressForm.bind(this)} />) }

    return (
      <div>
        <Grid>
          <Dimmer active={loading} inverted>
            <Loader inverted>Loading</Loader>
          </Dimmer>

          <Grid.Column mobile={16} tablet={5} computer={5}>
            <Segment>
            <Grid>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                <AutoPlaySwipeableViews index={this.state.slideIndex} onChange={this.handleSlideChange.bind(this)}>
                  {(photos.concat(newPhotos)).map((photo, index) => (
                    <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}} key={index}>
                      <Image style={{maxHeight: 350, margin: 'auto', display: 'block'}} src={photo.preview ? photo.preview : photo} />
                    </div>
                  ))}
                </AutoPlaySwipeableViews>
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                <Dropzone
                  ref={(node) => { dropzoneRef = node; }}
                  accept="image/jpeg, image/png" 
                  disableClick={photosLength >= 6}
                  preventDropOnDocument={photosLength >= 6}
                  onDrop={this.onDrop.bind(this)}
                  style={{display: 'hidden'}} />
                <div className='ui two buttons'>
                  <Button basic color='green' onClick={() => { dropzoneRef.open() }}>Add Photo</Button>
                  <Button basic color='red' value={slideIndex} onClick={this.removePhoto.bind(this)}>Remove</Button>
                </div>
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                  {(photos.concat(newPhotos)).map((photo, index) => (
                    <Image style={{ maxHeight: 50, maxWidth: 50, margin: 5, cursor: 'pointer', display: 'inline'}} src={photo.preview ? photo.preview : photo} key={index} onClick={()=>{self.handleSlideChange(index)}} />
                  ))}
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                <Popup
                  trigger={<Button fluid primary onClick={this.save.bind(this)}>Save</Button>}
                  content={this.state.popupContent}
                  on='click'
                  position='top right'
                  open={this.state.isPopupOpen}
                  onClose={this.handleClosePopup.bind(this)}
                />
                <Message
                  visible={photoError}
                  hidden={!photoError}
                  attached='bottom'
                  error
                  content={photoErrorMessage}
                />
              </Grid.Column>
            </Grid>
            </Segment>
          </Grid.Column>

          <Grid.Column mobile={16} tablet={11} computer={11}>
            <Form>
              <Segment>
                <Grid>
                  <Grid.Column mobile={16} tablet={16} computer={16}>               
                    <Form.Input error={titleError} label={'Title' + (titleError ? ' - '+titleErrorMessage : '')} placeholder='e.g iPhone X Silver 256 GB' value={title} name='title' onChange={this.handleChange.bind(this)} />             
                  </Grid.Column>
                  
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Form.Field error={priceError}>
                      <label>{'Price' + (priceError ? ' - '+priceErrorMessage : '')}</label>
                      <Input label='AED' labelPosition='right' placeholder='Price' value={price} name='price' onChange={this.handleChange.bind(this)} />
                    </Form.Field>
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Form.Input error={quantityError} label={'Quantity' + (quantityError ? ' - '+quantityErrorMessage : '')} placeholder='Quantity' value={quantity} name='quantity' onChange={this.handleChange.bind(this)} />
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
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
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    {/*<Form.Dropdown
                      error={sizeError}
                      label={'Size' + (sizeError ? ' - '+sizeErrorMessage : '')}
                      onChange={this.handleChange.bind(this)}
                      options={sizeOptions.map((option, index) => ({ key: index, text: option, value: index }))}
                      placeholder='Select a size'
                      selection
                      name='size'
                      value={size}
                    />*/}
                    <Form.Field error={weightError}>
                      <label>{'Approximate weight*' + (weightError ? ' - '+weightErrorMessage : ' (required for shipping)')}</label>
                      <Input label='grams' labelPosition='right' placeholder='Weight' value={weight} name='weight' onChange={this.handleChange.bind(this)} />
                    </Form.Field>
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Form.Dropdown
                      error={conditionError}
                      label={'Condition*' + (conditionError ? ' - '+conditionErrorMessage : '')}
                      onChange={this.handleChange.bind(this)}
                      options={conditionOptions.map(option => ({ key: option, text: option, value: option }))}
                      placeholder='Select a condition'
                      selection
                      name='condition'
                      value={condition}
                    />
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Form.Dropdown
                      error={ageError}
                      label={'Age*' + (ageError ? ' - '+ageErrorMessage : '')}
                      onChange={this.handleChange.bind(this)}
                      options={ageOptions.map(option => ({ key: option, text: option, value: option }))}
                      placeholder='Select a condition'
                      selection
                      name='age'
                      value={age}
                    />
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Form.Dropdown
                      error={usageError}
                      label={'Usage*' + (usageError ? ' - '+usageErrorMessage : '')}
                      onChange={this.handleChange.bind(this)}
                      options={usageOptions.map(option => ({ key: option, text: option, value: option }))}
                      placeholder='Select a usage'
                      selection
                      name='usage'
                      value={usage}
                    />
                  </Grid.Column>
                  <Grid.Column mobile={16} tablet={8} computer={8}>
                    <Form.Dropdown
                      error={warrantyError}
                      label={'Warranty*' + (warrantyError ? ' - '+warrantyErrorMessage : '')}
                      onChange={this.handleChange.bind(this)}
                      options={warrantyOptions.map(option => ({ key: option, text: option, value: option }))}
                      placeholder='Select a warranty'
                      selection
                      name='warranty'
                      value={warranty}
                    />
                  </Grid.Column>
                </Grid>
              </Segment>
              <Segment>
                <Form.TextArea error={descriptionError} label={'Description*' + (descriptionError ? ' - '+descriptionErrorMessage : '')} placeholder='Description' value={description} name='description' onChange={this.handleChange.bind(this)} />
              </Segment>

              <Message
                visible={addressError}
                hidden={!addressError}
                attached
                error
                content={addressErrorMessage}
              />
              <Address selection selectedAddressId={selectedAddressId} openAddressForm={this.openAddressForm.bind(this)} selectAddressId={((value) => { this.setState({ selectedAddressId: value }); }).bind(this)} />
            </Form>
          </Grid.Column>

        </Grid>
      </div>
    );
  }
}

export default withRouter(AddProduct);


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

var conditionOptions = [
  'Perfect inside and out',
  'Almost no noticeable problems or flaws',
  'A bit of wear and tear, but in good working condition',
  'Normal wear and tear for the age of the item, a few problems here and there',
  'Above average wear and tear, the item may need a bit of repair to work properly'
];

var ageOptions = [
  'Brand New',
  '0-1 month',
  '1-6 months',
  '6-12 months',
  '1-2 years',
  '2-5 years',
  '5-10 years',
  '10+ years'
];

var usageOptions = [
  'Still in original packaging',
  'Out of original packaging, but only used once',
  'Used only a few times',
  'Used an average amount, as frequently as would be expected',
  'Used an above average amount since purchased'
];

var warrantyOptions = [
  'Yes',
  'No',
  'Does not apply'
];

var sizeOptions = [
  // 'Document up to 2kg',
  // 'Small parcel up to 3kg',
  'Small parcel up to 5kg',
  'Parcel up to 10kg',
  'Parcel up to 30kg',
  'Parcel up to 100kg',
];
