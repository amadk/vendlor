import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, TextArea, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import { forEachAsync } from 'forEachAsync';
import moment from 'moment';

export default props => {
  const payout = props.item
  return (
    <Segment attached='top'>
      <Grid>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          ID: {payout.id}<br/>
          Name: {payout.amount}<br/>
          Email: {payout.destination}<br/>
          Phone: {payout.type}
        </Grid.Column>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          Available balance: {payout.currency}<br/>
          Pending balance: {payout.description}<br/>
          Status: {payout.status}<br/>
        </Grid.Column>
      </Grid>
    </Segment>
  )
}
