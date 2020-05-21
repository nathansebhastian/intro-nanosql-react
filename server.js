const express = require('express');
const { nSQL } = require("@nano-sql/core");
const { MySQL } = require("@nano-sql/adapter-mysql");

const app = express();
app.use(express.json())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

nSQL().createDatabase({
  id: "mysql-db",
  mode: new MySQL({
    host: "localhost",
    database: "test",
    user: "root",
    password: ""
  }),
  tables: [
    {
      name: "tb_users",
      model: {
        "id:uuid": {pk: true},
        "name:string": {},
        "age:int": {},
        "role:string": {}
      }
    }
  ],
})

app.get('/get', (req, res) => {
  nSQL("tb_users").query("select").exec()
  .then( rows => {
    res.json(rows)
  })
});

app.post('/save', (req, res) => {
  const { name, age, role } = req.body
  nSQL("tb_users").query("upsert", {name, age, role}).exec()
  .then(
    res.json({message: 'Data is saved!'})
  )
});

app.delete('/delete/:id', (req, res) => {
  const { id } = req.params
  nSQL("tb_users").query("delete").where(['id', '=', id]).exec()
  .then(
    res.json({message: 'User is deleted!'})
  )
});
  


