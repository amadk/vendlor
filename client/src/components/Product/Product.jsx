import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Table, Button, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider } from 'semantic-ui-react'
import axios from 'axios';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

class Product extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slideIndex: 0,
      photos: [],
      quantityInput: 1,
      popupContent: '',
      category: '',
      condition: '',
      isPopupOpen: false,
      modalOpen: false
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
    console.log(this.props.match.params.productId)
    var productId = this.props.match.params.productId;

    axios.get('/api/products/'+productId)
    .then(response => {
      console.log(response)
      self.setState(response.data)
      callback();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  getProductPhotos () {
    var self = this;
    var productId = this.props.match.params.productId
    console.log('get product photos')
    axios.get('/api/products/'+productId+'/photos')
    .then(response => {
      console.log(response)
      self.setState({
        photos: response.data.map(photo => ('https://s3.ap-south-1.amazonaws.com/dibba/'+photo.key)),
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

  nextPhoto () {
    if (this.state.photos.length > 0) {
      this.setState({
        slideIndex: this.state.slideIndex === this.state.photos.length-1 ? 0 : this.state.slideIndex+1
      })      
    }
  }

  previousPhoto () {
    if (this.state.photos.length > 0) {
      this.setState({
        slideIndex: this.state.slideIndex === 0 ? this.state.photos.length-1 : this.state.slideIndex-1
      })
    }
  }

  addToCart () {
    var self = this;
    if (this.props.isLoggedIn) {
      axios.post('/api/cart/'+this.props.match.params.productId, {
        quantity: self.state.quantityInput
      })
      .then(response => {
        console.log(response)
        self.setState({
          popupContent: response.data,
          isPopupOpen: true 
       })

        self.timeout = setTimeout(() => {
          self.setState({ isPopupOpen: false })
        }, 2500)
      })
    } else {
      self.setState({
        popupContent: 'login',
        isPopupOpen: true 
      })

      self.timeout = setTimeout(() => {
        self.setState({ isPopupOpen: false })
      }, 5000)
    }
  }

  handleClosePopup () {
    this.setState({ isPopupOpen: false })
    clearTimeout(this.timeout)
  }

  handleOpen () { this.setState({ modalOpen: true }) }

  handleClose () { this.setState({ modalOpen: false }) }

  addQuantity () {
    const { quantityInput, quantity } = this.state;
    if (quantityInput < quantity && quantityInput !== "" && this.props.isLoggedIn) {
      this.setState({
        quantityInput: parseInt(quantityInput)+1
      })
    }
  }

  subtractQuantity () {
    const { quantityInput } = this.state;
    if (quantityInput > 0 && quantityInput !== "" && this.props.isLoggedIn) {
      this.setState({
        quantityInput: parseInt(quantityInput)-1
      })
    }
  }

  handleQuantityChange (e, { value }) { 
    if (!isNaN(parseInt(value))) {
      if (value < 0) {
        this.setState({ 
          quantityInput: 0 
        })
      } else if (value > this.state.quantity) {
        this.setState({ 
          quantityInput: parseInt(this.state.quantity)
        }) 
      } else {
        this.setState({ 
          quantityInput: parseInt(value)
        })       
      }
    } else if (value === "") {
      this.setState({ quantityInput: value })
    }
  }


  render() {
    const { slideIndex, id, title, quantity, price, photos, description, quantityInput, condition, category, weight, age, usage, warranty } = this.state
    var self = this;
    console.log(this.props.isLoggedIn)
    return (
      <Grid centered>
      <Grid.Column mobile={16} tablet={16} computer={13}>
        <Grid>
          <Grid.Column mobile={16} tablet={7} computer={7}>
            <Grid>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                <AutoPlaySwipeableViews index={this.state.slideIndex} onChange={this.handleSlideChange.bind(this)}>
                  {photos.map((photo, index) => (
                    <Image fluid src={photo} key={index} verticalAlign='middle' onClick={this.handleOpen.bind(this)}  />
                  ))}
                </AutoPlaySwipeableViews>
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={16}>
                <Image.Group size='mini'>
                  {photos.map((photo, index) => (
                    <Image src={photo} key={index} onClick={()=>{self.handleSlideChange(index)}} style={{cursor: 'pointer'}}/>
                  ))}
                </Image.Group>
              </Grid.Column>
            </Grid>
          </Grid.Column>

          <Grid.Column mobile={16} tablet={9} computer={9}>

              <Header as='h2'>
                {title}
                <Header.Subheader>{price} AED</Header.Subheader>
              </Header>
              <Divider />

              <Grid>
                <Grid.Column mobile={16} tablet={7} computer={5}>
                  <Input disabled={!this.props.isLoggedIn} fluid labelPosition='right' value={quantityInput} onChange={this.handleQuantityChange.bind(this)}>
                    <Label basic style={{cursor: 'pointer', width: '20%', textAlign: 'center'}} onClick={this.subtractQuantity.bind(this)}>-</Label>
                    <input style={{textAlign: 'center', width: '100px'}} />
                    <Label basic style={{cursor: 'pointer', width: '20%', textAlign: 'center'}} onClick={this.addQuantity.bind(this)}>+</Label>
                  </Input>
                </Grid.Column>
                <Grid.Column mobile={16} tablet={7} computer={5}>
                  {this.props.isLoggedIn ? (
                    <Popup
                      trigger={<Button fluid primary onClick={this.addToCart.bind(this)}><Icon name='add to cart'/> Add to cart</Button>}
                      content={this.state.popupContent}
                      on='click'
                      position='top right'
                      open={this.state.isPopupOpen}
                      onClose={this.handleClosePopup.bind(this)}
                    />
                  ) : (
                    <Popup
                      trigger={<Button fluid basic onClick={this.addToCart.bind(this)}><Icon name='add to cart'/> Add to cart</Button>}
                      on='click'
                      position='top right'
                      open={this.state.isPopupOpen}
                      onClose={this.handleClosePopup.bind(this)}
                    >
                      <Popup.Content>
                        Please <Link to='/login'>Login</Link> or <Link to='/signup'>Sign up</Link> to add to cart
                      </Popup.Content>
                    </Popup>
                  )}
                </Grid.Column>
              </Grid>

              <Divider />
              <Table style={{margin: 0}}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell colSpan='2'>Details</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell collapsing>Category:</Table.Cell>
                    <Table.Cell>{category}</Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell collapsing>Condition:</Table.Cell>
                    <Table.Cell>{condition}</Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell collapsing>Age:</Table.Cell>
                    <Table.Cell>{age}</Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell collapsing>Usage:</Table.Cell>
                    <Table.Cell>{usage}</Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell collapsing>Warranty:</Table.Cell>
                    <Table.Cell>{warranty}</Table.Cell>
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell collapsing>Weight:</Table.Cell>
                    <Table.Cell>{weight} grams</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table> 
              <Divider />
              <Header as='h4'>Description</Header>
              <div>{description}</div>

          </Grid.Column>
          {/*<Grid.Column mobile={16} tablet={4} computer={4}>
            <Segment disabled>
              Shipping: 3-5 Business days
              <Divider />
              <Input fluid labelPosition='right' value={quantityInput} name='quantityInput' onChange={this.handleChange.bind(this)}>
                <Label basic style={{cursor: 'pointer', width: '20%', textAlign: 'center'}} onClick={() => {self.setState({quantityInput: parseInt(quantityInput)-1})}}>-</Label>
                <input style={{textAlign: 'center'}} />
                <Label basic style={{cursor: 'pointer', width: '20%', textAlign: 'center'}} onClick={() => {self.setState({quantityInput: parseInt(quantityInput)+1})}}>+</Label>
              </Input>
              <Divider />
              <Button primary fluid>Add to cart</Button>
            </Segment>
          </Grid.Column>*/}
        </Grid>

        <Modal
          open={this.state.modalOpen}
          onClose={this.handleClose.bind(this)}
          size='small'
        >
          <Card style={{width: '100%'}}>
            <AutoPlaySwipeableViews index={this.state.slideIndex} onChange={this.handleSlideChange.bind(this)}>
              {photos.map((photo, index) => (
                <Image src={photo} key={index} verticalAlign='middle'  />
              ))}
            </AutoPlaySwipeableViews>
            <Card.Content extra>
              <Grid textAlign='center' columns='equal'>
                <Grid.Column>
                  <Icon style={{cursor: 'pointer'}} name='chevron left' onClick={this.previousPhoto.bind(this)} />
                </Grid.Column>
                <Grid.Column width={10}>
                  {slideIndex+(photos.length>0?1:0)+'/'+photos.length}
                </Grid.Column>
                <Grid.Column>
                  <Icon style={{cursor: 'pointer'}} name='chevron right' onClick={this.nextPhoto.bind(this)} />
                </Grid.Column>
              </Grid>
            </Card.Content>
            <Card.Content extra>
              <Image.Group size='mini'>
                {photos.map((photo, index) => (
                  <Image src={photo} key={index} onClick={()=>{self.handleSlideChange(index)}} style={{cursor: 'pointer'}}/>
                ))}
              </Image.Group>
            </Card.Content>
          </Card>
          <Modal.Actions>
            <Button color='green' onClick={this.handleClose.bind(this)} inverted>
              <Icon name='checkmark' /> Got it
            </Button>
          </Modal.Actions>
        </Modal>
      </Grid.Column>

      </Grid>
    );
  }
}


export default Product