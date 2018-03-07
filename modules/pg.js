const client = new (require('pg').Client)

client.connect()

module.exports = client
