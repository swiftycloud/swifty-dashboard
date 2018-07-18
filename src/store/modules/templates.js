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
        source: 'def Main(req):\n' +
                '    return {"message": "hw:python:%s" % req.args[\'name\']}, None',
        args: { name: 'username' }
      },

      {
        id: 2,
        name: 'Maria DB Select',
        description: 'Sample SQL function, that executes SELECT query on a given Maria database and the table name',
        language: 'python',
        source: 'import pymysql.cursors\n' +
                'import os\n' +
                'import swifty\n' +
                '\n' +
                'def Main(req):\n' +
                '    db = swifty.MariaConn(req.args[\'dbname\'])\n' +
                '    res = "invalid"\n' +
                '    with db.cursor() as cursor:\n' +
                '        if req.args[\'action\'] == \'create\':\n' +
                '           cursor.execute("CREATE TABLE `data` (`key` VARCHAR(64), `val` VARCHAR(64))")\n' +
                '            res = "done"\n' +
                '        elif req.args[\'action\'] == \'insert\':\n' +
                '            cursor.execute("INSERT INTO `data` (`key`, `val`) VALUES (%s, %s)", (req.args[\'key\'], req.args['val']))\n' +
                '            res = "done"\n' +
                '        elif req.args[\'action\'] == \'select\':\n' +
                '            cursor.execute("SELECT `val` FROM `data` WHERE `key` = %s", (req.args[\'key\'],))\n' +
                '            res = cursor.fetchone()[\'val\']\n' +
                '    db.commit()\n' +
                '    return { "res": res }, None',
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
        source: 'from pymongo import MongoClient\n' +
                'import os\n' +
                'import swifty\n' +
                '\n' +
                'def Main(req):\n' +
                '    db = swifty.MongoDatabase(req.args[\'dbname\'])\n' +
                '    colname = req.args[\'collection\']\n' +
                '    col = db[colname]\n' +
                '\n' +
                '    if req.args[\'action\'] == \'insert\':\n' +
                '        col.insert_one({ "key": req.args[\'key\'], "val": req.args[\'val\'] })\n' +
                '        return { "res": "done" }\n' +
                '\n' +
                '    if req.args[\'action\'] == \'select\':\n' +
                '        res = col.find_one({ "key": req.args[\'key\'] })\n' +
                '        return { "res": res[\'val\'] }\n' +
                '\n' +
                '    return { "res": "invalid" }, None',
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
        source: 'func Main(rq: Request) -> Encodable {\n' +
                '    return ["message": "hw:swift:" + rq.args!["name"]!]\n' +
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
                'func Main(rq *Request) (interface{}, *Responce) {\n' +
                '    return map[string]string{"message": "ok"}, nil\n' +
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
