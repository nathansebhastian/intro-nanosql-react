const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const { nSQL } = require("@nano-sql/core");
const { MySQL } = require("@nano-sql/adapter-mysql");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

nSQL().createDatabase({
  id: "mysql-db",
  mode: new MySQL({ // required
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
  


