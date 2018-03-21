import React from 'react';

import './loading.css';

// import logo from '../../assets/logo-square-color.svg';

const Loading = ({ shouldHideWhen }) => (
  <div id="loading" className={shouldHideWhen ? 'not-showing' : ''}>
    <img src="/images/logo-square-color.svg" className="logo" alt="OpenMined" />
  </div>
);

export default Loading;
