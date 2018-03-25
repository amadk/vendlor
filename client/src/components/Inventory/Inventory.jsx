import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Table, Dimmer, Loader, Header, Button, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid } from 'semantic-ui-react'
import axios from 'axios';

class Inventory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      inventoryRequestComplete: false
    }
  }

  componentDidMount () {
    var self = this;
    axios.get('/api/products/inventory')
    .then(function (response) {
      self.setState({
        products: response.data,
        inventoryRequestComplete: true
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  publishProduct (e, {value}) {
    var self = this;
    axios.get('/api/products/publish/'+value)
    .then(function (response) {

    })
    .catch(function (error) {
      console.log(error);
    });
  }

  deleteProduct (e, { value }) {
    var self = this;

    axios.delete('/api/products/'+value)
    .then(function (response) {
      location.reload()
    })
    .catch(function (error) {
      console.log(error);
    });
  }


  render() {
    var self = this;
    const { products, inventoryRequestComplete } = this.state;

    if (!inventoryRequestComplete) {
      return (
        <div>
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        </div>
      )
    } else {
      if (products.length === 0) {
        return (
          <div>
            <Menu secondary stackable>
              <Menu.Item><Header as='h2'>Your Inventory</Header></Menu.Item>
              <Menu.Menu position='right'>
                <Menu.Item><Button primary as={Link} to='/addproduct'>Add Product</Button></Menu.Item>
              </Menu.Menu>
            </Menu>
            <Segment textAlign='center' padded='very'>
              <Header as='h1'>Your inventory is empty</Header>
            </Segment>
          </div>
        )
      } else {
        return (
          <div>
            <Menu secondary stackable>
              <Menu.Item><Header as='h2'>Your Inventory</Header></Menu.Item>
              <Menu.Menu position='right'>
                <Menu.Item><Button primary as={Link} to='/addproduct'>Add Product</Button></Menu.Item>
              </Menu.Menu>
            </Menu>
            <Grid>
              {products.map((product, index) => (
                <Grid.Column mobile={16} tablet={8} computer={4} key={index}>
                  <Card fluid>
                    <Link to={'/products/'+product.id} style={{height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                      <Image style={{maxHeight: 250, margin: 'auto', display: 'block'}} src={'https://s3.ap-south-1.amazonaws.com/vendlor/'+product.primaryPhoto}  />
                    </Link>
                    <Card.Content as={Link} to={'/products/'+product.id}>
                      <Card.Header>
                        {product.title}
                      </Card.Header>
                      <Card.Meta>
                        <span className='date'>
                          Price: {product.price}<br/>
                          Verification status: {product.status}
                        </span>
                      </Card.Meta>
                    </Card.Content>

                    <Card.Content extra>
                      <div className='ui two buttons'>
                        <Button basic color='green' as={Link} to={'/editproduct/'+product.id}>Edit</Button>
                        <Button basic color='red' value={product.id} onClick={self.deleteProduct.bind(self)}>Delete</Button>
                      </div>
                    </Card.Content>

                  </Card>
                </Grid.Column>
              ))}
            </Grid>
          </div>
        );
      }
    }
  }
}

export default Inventory