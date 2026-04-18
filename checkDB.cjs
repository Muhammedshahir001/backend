const dns = require('dns').promises;
async function run() {
  try {
    const srvs = await dns.resolveSrv('_mongodb._tcp.cluster0.kt0gapo.mongodb.net');
    console.log(srvs);
    if(srvs.length > 0) {
      const target = srvs[0].name;
      const ips = await dns.resolve4(target);
      console.log('Resolved IPs:', ips);
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(`mongodb://Shahir:karmaecommerce@${ips[0]}:${srvs[0].port}/Heedy?authSource=admin&tls=true&tlsAllowInvalidCertificates=true`);
      await client.connect();
      console.log('Connected to Atlas directly!');
      const orders = await client.db('Heedy').collection('orders').find({}).toArray();
      console.log('Orders in DB:', JSON.stringify(orders, null, 2));
      await client.close();
    }
  } catch(e) {
    console.error('Error:', e);
  }
}
run();
