import "fontsource-noto-sans-jp"
import "fontsource-noto-sans-jp/400.css"
import "fontsource-noto-sans-jp/500.css"

import React from 'react';
import { Provider } from 'react-redux';
import store from './src/state/store';

export const wrapRootElement = ({ element }) => {
    return <Provider store={store}>{element}</Provider>
};