import React from 'react';
import { Container, Header} from 'semantic-ui-react'

export default props => {
  return (
    <Container text>
      <Header as='h2'>How To Buy</Header>
      1- Once you receive the product, you have 24 hours to return it<br/>
      2- To return the product, go on the track page<br/>
      3- Add the product to your return cart<br/>
      4- Go on the return cart page and select you reason for returning the item<br/>
      5- Click confirm<br/>
      6- You can cancel a return before the shipping process begins<br/>
      7- The driver will pick up the item from the location it was delivered to<br/>
      8- Please ensure it is in the same condition as you received it<br/>
      9- Hand the item to the driver and await the item to be delivered to the seller<br/>
      10- Once the seller receives the item, the price of the item will be debited to your Vendlor account, which can be viewed on you Profile page<br/>
      11- You can use your Vendlor balance to purchase items on the website<br/>
      12- You can withdraw your balance through a bank transfer or a cash delivery<br/>
      13- A cash delivery withdrawal under 100 AED will cost 10 AED<br/>
      14- Cash withdrawals above 100 AED and bank transfer withdrawls of any amount are free<br/>
    </Container>
  )
}