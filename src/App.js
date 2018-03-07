import React, { Component } from 'react';
import axios from 'axios';
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
    this.setState({ messages: [ JSON.parse(e.data), ...this.state.messages ] });
  };

  sendMessage = (e) => {
    e.preventDefault();
    this.websocket.send(JSON.stringify({
      name: this.state.username,
      message: this.state.message,
      color: `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)})`,
    }));
    this.setState({ message: "" });
  };

  handleMessageChange = (e) => {
    this.setState({ message: e.target.value });
  };

  renderMessages = () => {
    return this.state.messages.map((message, i) => {
      return (
        <div className="Message-wrapper" key={i} style={{ backgroundColor: message.color }}>
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
