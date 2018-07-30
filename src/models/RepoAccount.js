import BaseModel from './BaseModel'

export default class RepoAccount extends BaseModel {
  resource () {
    return 'accounts'
  }
}
