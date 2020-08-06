import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import user from './user';
import post from './post';

const rootReducer = combineReducers({
  idex: (state = {}, action) => {
    switch (action.type) {
      case HYDRATE:
        console.log({ ...state, ...action.payload });
      default:
        return state;
    }
  },
  user,
  post,
});

export default rootReducer;
