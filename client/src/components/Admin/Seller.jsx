import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, TextArea, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import { forEachAsync } from 'forEachAsync';
import moment from 'moment';

export default props => {
  const seller = props.item
  return (
    <Segment attached='top'>
      <Grid>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          ID: {seller.id}<br/>
          Name: {seller.fullName}<br/>
          Email: {seller.email}<br/>
          Phone: {seller.mobile}
        </Grid.Column>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          Available balance: {seller.availbleBalance}<br/>
          Pending balance: {seller.pendingBalance}<br/>
          Status: {seller.status}<br/>
        </Grid.Column>
      </Grid>
    </Segment>
  )
}
