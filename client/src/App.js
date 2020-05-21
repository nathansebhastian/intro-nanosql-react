import React from 'react'
import Axios from 'axios'
import {nSQL} from '@nano-sql/core'

class App extends React.Component {

  state = {
    name: '',
    age: '',
    role: '',
    users: []
  }

  getMerchant = () => {
    Axios.get('/get')
    .then(res => {
      this.setState({users: res.data});
    });
  }

  handleDelete = () => {
    let id = prompt('Enter user id');
    if (id){
      Axios.delete(`/delete/${id}`)
      .then(response => {
        alert(response.data.message)
        this.getMerchant()
      })
    }
  }

  componentDidMount() {
    this.getMerchant()

    nSQL().createDatabase({
      mode: "LS",
      id: "ls-db",
      tables: [
        {
          name: "tb_temp",
          model: {
              "id:uuid": {pk: true},
              "data:string": {},
              "form:string": {}
          }
        }
      ]
    }).then(() => {
      nSQL("tb_temp").query("select").where(['form', '=', 'user']).exec().then((row) => {
        console.log(row)
        if(row.length){
          console.log('update state')
          const data = JSON.parse(row[0].data)
          this.setState({
            name: data.name,
            age: data.age,
            role: data.role
          })
        } else {
          const {name, age, role} = this.state
          nSQL("tb_temp")
          .query("upsert",{data: JSON.stringify({name, age, role}), form: 'user'})
          .exec()      
        }
      })
    })
  }

  componentDidUpdate() {
    const {name, age, role} = this.state
    nSQL("tb_temp")
    .query("upsert",{data: JSON.stringify({name, age, role})})
    .where(['form', '=', 'user'])
    .exec().then(
      console.log('Data updated')
    )
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const {name, age, role} = this.state
    Axios.post('/save', {
      name,
      age,
      role
    })
    .then(response => {
      alert(response.data.message)
      this.setState({
        name: '',
        age: '',
        role: ''
      })
      this.getMerchant()
    })
  }

  render() {
    const {name, age, role, users} = this.state
    return(
      <div className='app'>
        <h1>Auto-save form with NanoSQL for local storage and MySQL</h1>
        <h2>Current data: </h2>
        <ul>
        {
          users.map( user => {
            return (
              <li key={user.id}> {user.id} / {user.name} / {user.age} / {user.role} </li>
            )
          })
        }
        </ul>
        <form onSubmit={this.handleSubmit}>
        <div>
          <label>Name: </label>
          <input
            name="name"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={event => this.setState({name: event.target.value})}
            />
        </div>
        <div>
          <label>Age: </label>
          <input
            name="age"
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={event => this.setState({age: event.target.value})}
            />
        </div>
        <div>
          <label>Role: </label>
          <input
            name="age"
            type="text"
            placeholder="Enter role"
            value={role}
            onChange={event => this.setState({role: event.target.value})}
            />
        </div>
        <button type='submit'>Submit</button>
        </form>
        <button onClick={this.handleDelete}>Delete</button>
      </div>
    )
  }
}

export default App