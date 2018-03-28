import React from 'react';
import { Link } from 'react-router-dom';
import { Segment, Dimmer, Loader, Menu, Header } from 'semantic-ui-react'
import axios from 'axios';

import AboutUs from './AboutUs.jsx'
import FAQs from './FAQs.jsx'
import HowToBuy from './HowToBuy.jsx'
import HowToReturn from './HowToReturn.jsx'
import HowToSell from './HowToSell.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'
import ReturnPolicy from './ReturnPolicy.jsx'
import SellerTermsAndConditions from './SellerTermsAndConditions.jsx'
import SellingPolicies from './SellingPolicies.jsx'
import TermsAndConditions from './TermsAndConditions.jsx'

var components = {
  'about-us': AboutUs,
  faqs: FAQs,
  'how-to-buy': HowToBuy,
  'how-to-return': HowToReturn,
  'how-to-sell': HowToSell,
  'privacy-policy': PrivacyPolicy,
  'return-policy': ReturnPolicy,
  'seller-terms-and-conditions': SellerTermsAndConditions,
  'selling-policies': SellingPolicies,
  'terms-and-conditions': TermsAndConditions
}

export default class Information extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Component: components[this.props.match.params.information]
    }
  }

  componentDidMount () {
    this.getInfo(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.getInfo(nextProps)
  }

  getInfo (props) {
    this.setState({
      Component: components[props.match.params.information]
    })
    window.scrollTo(0, 0);
  }


  render() {
    var self = this;
    const { Component } = this.state;

    return (
      <div>
        <Component />
      </div>
    )
  }
}

















