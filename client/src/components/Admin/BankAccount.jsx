import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, TextArea, Table, Step, Button, Sticky, Dimmer, Loader, Checkbox, Menu, Icon, Modal, Input, Form, Dropdown, Card, Image, Grid, Label, Header, Popup, Divider, List, Radio } from 'semantic-ui-react'
import axios from 'axios';
import { forEachAsync } from 'forEachAsync';
import moment from 'moment';

export default props => {
  const bankAccount = props.item
  return (
    <Segment attached='top'>
      <Grid>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          ID: {bankAccount.id}<br/>
          Name: {bankAccount.accountHolderName}<br/>
          bankName: {bankAccount.bankName}<br/>
          accountHolderType: {bankAccount.accountHolderType}
        </Grid.Column>
        <Grid.Column mobile={16} tablet={8} computer={8}>
          Available balance: {bankAccount.country}<br/>
          iban: {bankAccount.iban}<br/>
          currency: {bankAccount.currency}<br/>
          accountNumber: {bankAccount.accountNumber}<br/>
          Status: {bankAccount.status}<br/>
        </Grid.Column>
      </Grid>
    </Segment>
  )
}
