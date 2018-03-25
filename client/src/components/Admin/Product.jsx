import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, TextArea, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'

export default props => {
  console.log(props.item)
  const product = props.item;
  return (
    <Segment attached='top'>
      <div>
        {product.photos.map((photo, index2) => (
          <Image style={{ maxHeight: 125, margin: '5px 10px', cursor: 'pointer', display: 'inline'}} src={photo} />
        ))}
      </div>
      <Divider/>
      <Grid>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          Title: {product.title}<br/>
          Price: {product.price}<br/>
          Category: {product.category}<br/>
          Condition: {product.condition}
        </Grid.Column>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          Product ID: {product.id}<br/>
          Seller ID: {product.account_id}<br/>
          Size: {product.size}<br/>
          Quantity: {product.quantity}
        </Grid.Column>
      </Grid>
      <Divider/>
      Description:<br/>
      {product.description}
    </Segment>
  );   
}

var productStatuses = [
  'pending',
  'verified',
  'rejected'
]



