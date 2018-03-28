import React from 'react';
import { Container, Header} from 'semantic-ui-react'

export default props => {
  return (
    <Container text>
      <Header as='h2'>How To Buy</Header>
      1- First sign up or sign in<br/>
      2- Go on the product page and select add to cart<br/>
      3- Go on the cart page, select a payment method and a delivery address<br/>
      4- Click the submit button once you are finished reviewing your cart<br/>
      5- You can track your order from the track page<br/>
      6- You can cancel an order before shipping begins<br/>
      7- Once you receive the product, you have 24 hours to return it<br/>
    </Container>
  )
}