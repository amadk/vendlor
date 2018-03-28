import React from 'react';
import { Container, Header} from 'semantic-ui-react'

export default props => {
  return (
    <Container text>
      <Header as='h2'>How To Sell</Header>
      1- Go on the add product page<br/>
      2- Enter information about the product you want to sell<br/>
      3- Select a pick up address<br/>
      4- Click confirm<br/>
      5- Please wait until your product is verified, this usually takes less than 24 hours<br/>
      6- Once your product is verified, other users will be able to view and purchase your item<br/>

      7- You can view the items that you are selling on the Inventory page<br/>
      8- To edit an item, go on the inventory page and click the edit button on the product you wish to edit<br/>
      9- To delete an item, go on the inventory page and click the delete button on the product you wish to delete<br/>

    </Container>
  )
}