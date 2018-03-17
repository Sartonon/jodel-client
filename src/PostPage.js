import React, { Component } from 'react';
import axios from 'axios';
import Message from './Message';

class PostPage extends Component {
  state = {
    post: null,
  };

  async componentDidMount() {
    console.log(this.props);
    const data = await axios.get(
      `http://localhost:3010/api/messages/${this.props.match.params.id}`,
    );
    console.log(data);
    this.setState({ post: data.data });
  }

  render() {
    const { post } = this.state;

    return (
      <div style={{ backgroundColor: 'orange' }}>
        {post && (
          <Message
            handleClick={() => null}
            voteUp={() => null}
            voteDown={() => null}
            message={post}
          />
        )}
      </div>
    );
  }
}

export default PostPage;
