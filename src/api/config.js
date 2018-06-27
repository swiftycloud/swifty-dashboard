var request = new XMLHttpRequest()
request.open('GET', '/swifty.config.json', false)
request.send(null)

export default JSON.parse(request.responseText)
