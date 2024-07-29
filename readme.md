# hit concurrent request this way
> autocannon http://localhost:3355/admin/auth/test -a 1000 -c 5 -t 50



 <!-- rs.initiate(
  {
    _id: "rs0",
    version: 1,
    members: [
      { _id: 0, host: "mongo1:27016" },
      { _id: 1, host: "mongo2:27018" },
      { _id: 2, host: "mongo3:27019" }
    ]
  }
) 

mongodb://root:example@localhost:27016,localhost:27018,localhost:27019/?replicaSet=rs0&authSource=admin
-->