import BaseModel from './BaseModel'

export default class Repository extends BaseModel {
  resource () {
    return 'repos'
  }
}
