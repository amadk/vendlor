import React from 'react';
import { Segment, Grid} from 'semantic-ui-react'

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
