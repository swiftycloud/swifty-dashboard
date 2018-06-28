/*
  © 2018 SwiftyCloud OÜ. All rights reserved.
  Contact: info@swifty.cloud
*/

var request = new XMLHttpRequest()
request.open('GET', '/swifty.config.json', false)
request.send(null)

export default JSON.parse(request.responseText)
