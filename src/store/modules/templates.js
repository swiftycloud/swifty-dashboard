/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

export default {
  state: {
    templates: [
      {
        id: 0,
        name: 'Empty Function',
        description: 'Create your own function',
        language: 'python',
        source: '',
        args: {}
      },

      {
        id: 1,
        name: 'Hello World',
        description: 'Simple hello world function, returning a "Hello, $user" string taking $user from the "name" argument',
        language: 'python',
        source: 'def main(args):\n' +
                '    return {"message": "Hello, %s" % args[\'name\']}',
        args: { name: 'username' }
      },

      {
        id: 2,
        name: 'Maria DB Select',
        description: 'Sample SQL function, that executes SELECT query on a given Maria database and the table name',
        language: 'python',
        source: 'import swifty\n' +
                '\n' +
                'def main(args):\n' +
                '    db = swifty.MariaConn(args[\'db\'])\n' +
                '    with db.cursor() as cursor:\n' +
                '        cursor.execute("SELECT * FROM %s", (args[\'table\'],))\n' +
                '        res = cursor.fetchone()\n' +
                '    return res',
        args: {
          db: '<ID of mware attached>',
          table: 'mytable'
        }
      },

      {
        id: 3,
        name: 'MongoDB Lookup',
        description: 'Sample lookup in a given Mongo database and collection',
        language: 'python',
        source: 'import swifty\n' +
                '\n' +
                'def main(args):\n' +
                '    db = swifty.MongoDatabase(args[\'db\'])\n' +
                '    colname = args[\'collection\']\n' +
                '    col = db[colname]\n' +
                '\n' +
                '    return col.find_one({ "key": args[\'key\'] })',
        args: {
          db: '<ID of mongo mware>',
          collection: 'mycollection',
          key: 'foo'
        }
      },

      {
        id: 4,
        name: 'Hello World',
        description: 'Simple hello world function, returning a "Hello, $user" string taking $user from the "name" argument',
        language: 'swift',
        source: 'func Main(args: [String:String]) -> Encodable {\n' +
                '    return ["message": "hw:swift:" + args["name"]!]\n' +
                '}',
        args: { name: 'username' }
      },

      {
        id: 5,
        name: 'Base Template',
        description: 'Create your own function',
        language: 'golang',
        source: 'package main\n' +
                '\n' +
                'func Main(args map[string]string) interface{} {\n' +
                '    return ""\n' +
                '}',
        args: {}
      }
    ],

    resources: {
      memory: {
        '64MB': 64,
        '128MB': 128,
        '256MB': 256,
        '512MB': 512,
        '1GB': 1024
      },
      timeout: {
        '1 sec': 1000,
        '60 sec': 60000,
        '120 sec': 120000,
        '600 sec': 600000
      },
      rps: {
        '100K': 100000,
        '500K': 500000,
        '1M': 1000000,
        '5M': 5000000
      }
    }
  },

  getters: {
    getFunctionTemplates: state => state.templates,
    getFunctionTemplateByID: state => id => state.templates.find(item => item.id === id),
    getFunctionTemplatesByLang: state => lang => state.templates.filter(item => item.language === lang || item.language === 'any'),
    getFunctionResources: state => state.resources
  }
}
