import React from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Mypage from "./pages/Mypage";
import Ssissue from "./pages/Ssissue";
import axios from "axios";
import Nav from "./components/Nav"
import './App.css';
import SideNav from './components/SideNav';
import Contents from './components/Contents';
const today = function () {
  let tmp = new Date(), day = tmp.getDate().toString(), month = (tmp.getMonth() + 1).toString();
  if (day.length === 1) day = `0${day}`;
  if (month.length === 1) month = `0${month}`;
  return `${tmp.getFullYear()}-${month}-${day}`;
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: true,
      isWriting: false,
      userinfo: null,
      arrCommentRank: [],
      date: today(),
      postId: 0,
      title: null,
      voted: false,
      agree: 0,
      disagree: 0,
      comments: [],
      hotIssues: [],
      likeGet: 0,
      likeGive: 0,
      userdata: null,
    }
    this.handleIssue = this.handleIssue.bind(this);
    this.handleHotIssue = this.handleHotIssue.bind(this);
    this.handleDate = this.handleDate.bind(this);
    this.handleResponseSuccess = this.handleResponseSuccess.bind(this);
    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleSubmitLike = this.handleSubmitLike.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleGetUserData = this.handleGetUserData.bind(this);
    this.handleGuestLogin = this.handleGuestLogin.bind(this);
  }

  handleGuestLogin() {
    this.setState({
      isLogin: !this.state.isLogin,
    })
    axios.get("https://app.dailyissue.net/main", {
      // headers: {
      //   Authorization: `bear ${this.state.userinfo}`,
      //   credentials: 'include'
      // }
    })
      .then(data => {
        this.handleIssue(data.data);
        this.props.history.push("/")
      })
      .catch(e => console.log(e));
    axios.get(`https://app.dailyissue.net/main/hotissue/`)
      .then(data => {
        this.handleHotIssue(data.data.hotIssues);
      })
      .catch(e => console.log("not found hotIssues"));
  }

  handleGetUserData() {
    axios.get("https://app.dailyissue.net/mypage", {
      headers: {
        Authorization: `Bearer ${this.state.userinfo}`,
        credentials: 'include'
      }
    })
      .then(data => {
        this.setState({
          userdata: data.data.userData,
          likeGive: data.data.like,
        });
      });
    axios.get("https://app.dailyissue.net/main/like", {
      headers: {
        Authorization: `Bearer ${this.state.userinfo}`,
        credentials: 'include'
      }
    })
      .then(data => {
        this.setState({
          likeGet: data.data.like,
        });
      });
  }


  handleSubmitLike(id, postId) {
    if (!this.state.userinfo) return;
    axios
      .post('https://app.dailyissue.net/main/like', {
        commentId: id,
        postId: postId
      },
        {
          headers: {
            Authorization: `Bearer ${this.state.userinfo}`,
            credentials: 'include'
          }
        })
      // ????????? ?????? ???????????? ????????? ??????
      .then(data => {
        console.log(data.data);
        this.setState({ comments: data.data.comments });
      });
  }

  handleAddComment(id, text) {
    if (this.state.date !== today()) return;
    axios
      .post("https://app.dailyissue.net/main/comment",
        {
          "postId": id,
          "text": text
        },
        {
          headers: {
            Authorization: `bear ${this.state.userinfo}`,
            credentials: 'include'
          }
        }
      )
      .then(data => {
        this.setState({ comments: data.data.comments })
      });
  }

  handleDate(date) {
    this.setState({ date });
  }

  handleIssue(data) {
    const newState = {
      voted: data.voted,
      agree: (data.agree) ? data.agree : 0,
      disagree: (data.disagree) ? data.disagree : 0,
      comments: (data.comments) ? data.comments : []
    };
    if (data.postId) {
      newState.postId = data.postId;
      newState.title = data.title;
    }
    this.setState(newState);
  }

  handleHotIssue(hotIssues) {
    this.setState({
      hotIssues
    })
  }

  handleResponseSuccess(token) {
    this.setState({ isLogin: false, userinfo: token });
    // this.handleGetUserData();
    axios.get("https://app.dailyissue.net/main", {
      headers: {
        Authorization: `bear ${this.state.userinfo}`,
        credentials: 'include'
      }
    })
      .then(data => {
        this.handleIssue(data.data);
        this.props.history.push("/")
      })
      .catch(e => console.log(e));
    axios.get(`https://app.dailyissue.net/main/hotissue/`)
      .then(data => {
        this.handleHotIssue(data.data.hotIssues);
      })
      .catch(e => console.log("not found hotIssues"));
  }
  handleLogout() {
    this.setState({
      isLogin: true,
      isWriting: false,
      userinfo: null,
      arrCommentRank: [],
      date: today(),
      postId: 0,
      title: null,
      voted: false,
      agree: 0,
      disagree: 0,
      comments: [],
      hotIssues: [],
      likeGet: 0,
      likeGive: 0,
      userdata: null
    });
    this.props.history.push('/');
  }

  render() {
    const { isLogin, userinfo } = this.state;
    return (
      <div>
        <Switch>
          <Route render={() => {
            if (!isLogin) {
              return (
                <div className="App">
                  <Nav userinfo={this.state.userinfo}
                    handleLogout={this.handleLogout}
                    likeGet={this.state.likeGet}
                    likeGive={this.state.likeGive}
                    postId={this.state.postId}
                    handleIssue={this.handleIssue}
                  />
                  <div className="Components">
                    <SideNav hotIssues={this.state.hotIssues}
                      date={this.state.date}
                      handleDate={this.handleDate}
                      handleHotIssue={this.handleHotIssue}
                      handleIssue={this.handleIssue}
                      userinfo={this.state.userinfo}
                      history={this.props.history}
                    />
                    <Contents handleIssue={this.handleIssue}
                      date={this.state.date}
                      postId={this.state.postId}
                      title={this.state.title}
                      voted={this.state.voted}
                      agree={this.state.agree}
                      disagree={this.state.disagree}
                      comments={this.state.comments}
                      hotIssues={this.state.hotIssues}
                      userinfo={this.state.userinfo}
                      handleAddComment={this.handleAddComment}
                      handleSubmitLike={this.handleSubmitLike}
                      isWriting={this.state.isWriting}
                      userdata={this.state.userdata}
                      likeGive={this.state.likeGive}
                      likeGet={this.state.likeGet}
                      handleGetUserData={this.handleGetUserData}
                      handleLogout={this.handleLogout}
                    />
                  </div>
                </div>)
            }
            else {
              return (
                <Login handleResponseSuccess={this.handleResponseSuccess} handleGuestLogin={this.handleGuestLogin} />
              )
            }
          }
          }
          />
        </Switch>
      </div>
    );
  }
}


export default withRouter(App);
