import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Segment, Dimmer, Header, Card, Image, Grid, Loader } from 'semantic-ui-react'

const queryString = require('query-string');

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeRequestComplete: false,
      products: []
    }
  }

  componentDidMount () {
    this.getProducts(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.getProducts(nextProps)
  }

  getProducts (props) {
    var self = this;
    var params = queryString.parse(props.location.search)
    var link = '';

    if (params.search) {
      link = '?search='+params.search
    } else if (params.category) {
      link = '?category='+params.category      
    }

    axios.get('/api/products'+link)
    .then(function (response) {
      self.setState({
        products: response.data,
        homeRequestComplete: true
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }


  render() {
    const { products, homeRequestComplete } = this.state;
    if (!homeRequestComplete) {
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
          <Segment textAlign='center' padded='very'>
            <Header as='h1'>No products found</Header>
          </Segment>
        )
      } else {
        return (
          <div>
            <Grid>
              {products.map((product, index) => (
                <Grid.Column mobile={16} tablet={4} computer={4} key={index}>
                  <Card fluid >
                    <Image src={'https://s3.ap-south-1.amazonaws.com/vendlor/'+product.primaryPhoto} as={Link} to={'/products/'+product.id} />
                    <Card.Content as={Link} to={'/products/'+product.id}>
                      <Card.Header>
                        {product.title}
                      </Card.Header>
                      <Card.Meta>
                        <span className='date'>
                          Price: {product.price}
                        </span>
                      </Card.Meta>
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
