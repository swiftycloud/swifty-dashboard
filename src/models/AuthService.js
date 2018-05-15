import Model from '@/models/Model'
import Collection from '@/models/Collection'

export class AuthService extends Model {
  defaults () {
    return {
      id: null,
      name: null
    }
  }
}

export class AuthServiceList extends Collection {
  model () {
    return AuthService
  }

  defaults () {
    return {
      project: 'default'
    }
  }

  routes () {
    return {
      fetch: '/auths?project={project}'
    }
  }
}
