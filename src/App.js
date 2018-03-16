import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import shortid from 'shortid';
import {
  redirectToSignIn,
  isUserSignedIn,
  loadUserData,
  isSignInPending,
  handlePendingSignIn,
  signUserOut,
  putFile,
  getFile
} from 'blockstack';

export default class App extends Component {

  state = { user: {}, signedIn: false, value: '', notes: {}, loading: true }

  componentDidMount() {
    if (isUserSignedIn()) {
      this.getNotes()
      this.setState({ user: loadUserData().profile, signedIn: true })
    } else if (isSignInPending()) {
      handlePendingSignIn().then(() => { window.location = window.location.origin })
    } else {
      this.setState({ signedIn: false })
    }
  }

  signOut = () => signUserOut(window.location.href)

  signIn = () => redirectToSignIn()

  getNotes = () => (
    getFile('notes.json', { decrypt: true })
      .then(res => this.setState({ notes: JSON.parse(res), loading: false }))
  )

  addNote = e => {
    const notes = {
      ...this.state.notes,
      [shortid.generate()]: this.state.value
    }
    putFile('notes.json', JSON.stringify(notes), { encrypt: true })
      .then(() => this.setState({ notes, value: '' }))
    e.preventDefault();
  }

  handleChange = ({target: {value}}) => this.setState({value})

  render() {
    const { signedIn, user, value, loading, notes } = this.state;

    return (
      <div>
        <div className="navbar">
          <h1>Blocknotes</h1>
          { signedIn ? (
              <p>Welcome, {user.name} <button onClick={this.signOut}>Sign Out</button></p>
            ) : <button onClick={this.signIn}>Sign In</button>
          }
        </div>

        <div className="notes">
          { signedIn ? (
            <div>
              <form onSubmit={this.addNote}>
                <textarea value={this.state.value} onChange={this.handleChange} />
                <input type="submit" value="Add note" />
              </form>

              { !loading ? (
                Object.keys(notes).length > 0 ? (
                  Object.keys(notes).map(key => (
                    <div key={key} className="note">{notes[key]}</div>
                  ))
                ) : (
                  <div className="note note--empty">No notes yet. Start writing!</div>
                )
              ) : (
                <div className="loader"/>
              ) }

            </div>
          ) : (
            <div className="welcome">A decentralized and encrypted note-taking app</div>
          )}
        </div>
      </div>
    );
  }
}
