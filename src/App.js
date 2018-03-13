import React, { Component } from 'react';
import axios from 'axios';
import upIcon from './icons/ic_thumb_up_black_24px.svg';
import downIcon from './icons/ic_thumb_down_black_24px.svg';
import './App.css';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class App extends Component {
  state = {
    messages: [],
    username: "",
    usernameConfirmed: false,
    message: "",
    color: 0,
  };

  async componentDidMount() {
    this.getMessages();
    this.initWebSocket();
  }

  initWebSocket = () => {
    this.websocket = new WebSocket("ws://139.162.254.62/ws2");
    this.websocket.onmessage = this.handleMessage;
    this.websocket.onerror = this.handleError;
    this.websocket.onclose = this.handleOnClose;
  };

  getMessages = async () => {
    const { data } = await axios.get("http://139.162.254.62/jodel/api/messages");
    console.log(data);
    this.setState({ messages: data });
  };

  handleOnClose = () => {
    console.log("Connection closed, starting new one...");
    this.initWebSocket();
  };

  handleError = (error) => {
    console.log("error: ", error);
  };

  handleMessage = (e) => {
    const data = JSON.parse(e.data);
    console.log(data);
    if (data.type === "jodel") {
      this.setState({ messages: [ data, ...this.state.messages ] });
    } else if (data.type === "vote") {
      this.setState({
        messages: this.state.messages.map(m => {
          if (m.id === data.data.id) {
            return data.data;
          }
          return m;
        })
      });
    }
  };

  sendMessage = (e) => {
    e.preventDefault();
    this.websocket.send(JSON.stringify({
      type: 'jodel',
      name: this.state.username,
      message: this.state.message,
      color: `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)})`,
    }));
    this.setState({ message: "" });
  };

  handleMessageChange = (e) => {
    this.setState({ message: e.target.value });
  };

  voteUp = (id) => {
    this.websocket.send(JSON.stringify({
      type: 'upvote',
      id
    }));
  };

  voteDown = (id) => {
    this.websocket.send(JSON.stringify({
      type: 'downvote',
      id
    }));
  };

  renderMessages = () => {
    console.log("moi");
    return this.state.messages.map(message => {
      return (
        <div className="Message-wrapper" key={message.id} style={{ backgroundColor: message.color }}>
          <div className="Block-wrapper">
            <div
              className="Message-block"
              style={{
                color: "white"
              }}
            >
              <div className="Message-name">
                {message.name}
              </div>
              <div className="Message-content">{message.message}</div>
            </div>
            <div className="Message-vote">
              <img src={upIcon} alt="up" onClick={() => this.voteUp(message.id)} />
              <div style={{ color: "white", fontSize: "20px" }}>{message.votes}</div>
              <img
                src={downIcon}
                style={{
                  marginTop: '3px'
                }}
                alt="down"
                onClick={() => this.voteDown(message.id)}
              />
            </div>
          </div>
        </div>
      );
    });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Jodel</h1>
        </header>
        <div className="Chat-window">
          <div id="chatwindow" className="Message-div">
            {this.renderMessages()}
          </div>
          <form onSubmit={this.sendMessage}>
            <div className="Chat-input">
              <input className="Chat-inputfield" onChange={this.handleMessageChange} value={this.state.message} type="text" />
              <div className="Send-button" onClick={this.sendMessage}>Lähetä</div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
