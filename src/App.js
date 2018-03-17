import React, { Component } from 'react';
import moment from 'moment';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Message from './Message';
import PostPage from './PostPage';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class JodelWall extends Component {
  state = {
    messages: [],
    username: '',
    usernameConfirmed: false,
    message: '',
    color: 0,
    userAmount: 0,
  };

  async componentDidMount() {
    this.getMessages();
    this.initWebSocket();
  }

  componentWillUnmount() {
    this.closed = true;
    this.websocket.close();
  }

  initWebSocket = () => {
    this.websocket = new WebSocket("ws://139.162.254.62/ws2");
    this.websocket.onmessage = this.handleMessage;
    this.websocket.onerror = this.handleError;
    this.websocket.onclose = this.handleOnClose;
  };

  getMessages = async () => {
    const { data } = await axios.get("http://139.162.254.62/jodel/api/messages");
    this.setState({ messages: data });
  };

  handleOnClose = () => {
    if (!this.closed) {
      this.initWebSocket();
    }
  };

  handleError = error => {
    console.log('error: ', error);
  };

  handleMessage = e => {
    const data = JSON.parse(e.data);
    if (data.type === 'jodel') {
      this.setState({ messages: [data, ...this.state.messages] });
    } else if (data.type === 'vote') {
      this.setState({
        messages: this.state.messages.map(m => {
          if (m.id === data.data.id) {
            return data.data;
          }
          return m;
        }),
      });
    } else if (data.type === 'userAmount') {
      this.setState({
        userAmount: data.amount,
      });
    }
  };

  sendMessage = e => {
    console.log(moment().format('DD.MM.YYYY HH:mm'));
    e.preventDefault();
    this.websocket.send(
      JSON.stringify({
        type: 'jodel',
        name: this.state.username,
        message: this.state.message,
        color: `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(
          255,
        )})`,
        time: moment().format('DD.MM.YYYY HH:mm'),
      }),
    );
    this.setState({ message: '' });
  };

  handleMessageChange = e => {
    this.setState({ message: e.target.value });
  };

  voteUp = id => {
    this.websocket.send(
      JSON.stringify({
        type: 'upvote',
        id,
      }),
    );
  };

  voteDown = id => {
    this.websocket.send(
      JSON.stringify({
        type: 'downvote',
        id,
      }),
    );
  };

  renderMessages = () => {
    return this.state.messages.map(message => {
      return (
        <Message
          voteUp={this.voteUp}
          voteDown={this.voteDown}
          handleClick={() => this.props.history.push(`/post/${message.id}`)}
          key={message.id}
          message={message}
          history={this.props.history}
        />
      );
    });
  };

  render() {
    const { userAmount } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Jodel ({userAmount})</h1>
        </header>
        <div className="Chat-window">
          <div id="chatwindow" className="Message-div">
            {this.renderMessages()}
          </div>
          <div className="Chat-input">
            <input
              className="Chat-inputfield"
              onChange={this.handleMessageChange}
              value={this.state.message}
              type="text"
            />
            <div className="Send-button" onClick={this.sendMessage}>
              Lähetä
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const App = () => {
  return (
    <Router>
      <div style={{ height: '100%', backgroundColor: 'orange' }}>
        <Route exact path="/" component={JodelWall} />
        <Route exact path="/post/:id" component={PostPage} />
      </div>
    </Router>
  );
};

export default App;
