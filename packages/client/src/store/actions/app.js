import { appTypes, API } from './types'
import store from '../store'
import { setSelectedCycle } from './selectedCycle'

const toggleLoading = () => ({
  type: appTypes.toggleLoading,
})

const getGraph = () => ({
  type: API,
  api: {
    method: 'GET',
    url: '/currency/get-graph',
    onSuccess: (data) => store.dispatch({
      type: appTypes.getGraph,
      data,
    }),
  },
})

const getCycles = (currency, filterByCurrency) => ({
  type: API,
  api: {
    method: 'POST',
    url: '/currency/get-cycles',
    data: {
      currency,
      filterByCurrency,
    },
    onSuccess: (data) => {
      store.dispatch({
        type: appTypes.getCycles,
        data,
      })
      store.dispatch(toggleLoading())
      store.dispatch(setSelectedCycle(0))
    },
  },
})

const trade = (e, path) => {
  e.stopPropagation();
  console.log(1111111)

  return {
    type: API,
    api: {
      method: 'POST',
      url: '/currency/trade',
      data: {
        path,
      },
      onSuccess: (data)=>{
        console.log('ssssucess', data)
      },
    },
  };
}

export {
  toggleLoading,
  getGraph,
  getCycles,
  trade,
}
