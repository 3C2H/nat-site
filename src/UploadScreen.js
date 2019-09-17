import React, { Component } from 'react'
import './App.css'
import LoginScreen from './Loginscreen'

// Material-UI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import RaisedButton from 'material-ui/RaisedButton'
import FontIcon from 'material-ui/FontIcon'
import {blue500, red500, greenA200} from 'material-ui/styles/colors'
// import AppBar from 'material-ui/AppBar'
// import Drawer from 'material-ui/Drawer'
// import MenuItem from 'material-ui/MenuItem'

// Dropzone (local file selection)
import Dropzone from 'react-dropzone'

// Superagent (handles post/get requests to server)
let request = require('superagent')

let apiBaseUrl = 'http://localhost:4000/api/'

class UploadScreen extends Component {
  constructor(props){
    super(props)
    this.state= {
      role:'student',
      filesPreview:[],
      filesToBeSent:[],
      draweropen:false,
      printcount:10,
      printingmessage:'',
      printButtonDisabled:false
    }
  }

  componentWillMount() {
    // console.log("prop values",this.props.role)
    let printcount
    //set upload limit based on user role
    if(this.props.role){
      if(this.props.role == 'student') {
        printcount = 5
      }
      else if(this.props.role == 'teacher') {
        printcount =10
      }
    }
    this.setState({ printcount,role:this.props.role })
  }
  /*
  Function:handleCloseClick, Parameters: event,index
  Usage: used to remove file from filesPreview div
  if user clicks close icon adjacent to selected file
  */ 
  handleCloseClick(event,index) {
    // console.log("filename",index)
    let filesToBeSent=this.state.filesToBeSent
    filesToBeSent.splice(index,1)
    // console.log("files",filesToBeSent)
    let filesPreview=[]

    for(let i in filesToBeSent) {
      filesPreview.push(
        <div>
          { filesToBeSent[i][0].name }
          <MuiThemeProvider>
          <a href="#"><FontIcon
            className="material-icons customstyle"
            color={blue500}
            onClick={(event) => this.handleCloseClick(event,i)}
          >clear</FontIcon></a>
          </MuiThemeProvider>
        </div>
      )
    }
    this.setState({ filesToBeSent,filesPreview })
  }

  /*
  Function:onDrop, Parameters: acceptedFiles, rejectedFiles
  Usage: Is default event handler of react drop-Dropzone
  which is modified to update filesPreview div
  */
  onDrop(acceptedFiles, rejectedFiles) {
  // console.log('Accepted files: ', acceptedFiles[0].name)
  let filesToBeSent=this.state.filesToBeSent
  if(filesToBeSent.length < this.state.printcount) {
    filesToBeSent.push(acceptedFiles)
    let filesPreview=[]

    for(let i in filesToBeSent) {
      filesPreview.push(
        <div>
          { filesToBeSent[i][0].name }
          <MuiThemeProvider>
          <a href="#"><FontIcon
            className="material-icons customstyle"
            color={blue500}
            styles={{ top:10,}}
            onClick={(event) => this.handleCloseClick(event,i)}
          >clear</FontIcon></a>
          </MuiThemeProvider>
        </div>
      )
    }
    this.setState({ filesToBeSent,filesPreview })
  }
  else {
    alert("You have reached the limit of printing files at a time")
  }
  // console.log('Rejected files: ', rejectedFiles)
}

/*
  Function:handleClick, Parameters: event
  Usage: Handler of submit button responsible
  for handling file uploads to backend
*/
handleClick(event) {
  // console.log("handleClick",event)
  this.setState({ printingmessage:"Please wait until your files are being printed",printButtonDisabled:true })
  let self = this

  if(this.state.filesToBeSent.length>0) {
    let filesArray = this.state.filesToBeSent
    let req = request.post(apiBaseUrl+'fileprint')

    for(let i in filesArray) {
        // console.log("files",filesArray[i][0])
        req.attach(filesArray[i][0].name,filesArray[i][0])
    }
    req.end(function(err,res) {
      if(err) {
        console.log("error ocurred")
      }
      console.log("res",res)
      self.setState({ printingmessage:'',printButtonDisabled:false,filesToBeSent:[],filesPreview:[] })
      alert("File printing completed")
      // self.props.indexthis.switchPage()
    })
  }
  else {
    alert("Please upload some files first")
  }
}

/*
  Function:toggleDrawer, Parameters: event
  Usage: Toggles drawer state
  */
toggleDrawer(event) {
  // console.log("drawer click")
  this.setState({ draweropen: !this.state.draweropen })
}

/*
  Function:toggleDrawer, Parameters: event
  Usage: Closes the drawer when user clicks
  anywhere on the main div
  */
handleDivClick(event){
  // console.log("event",event)
  if(this.state.draweropen){
    this.setState({draweropen:false})
  }
}

/*
  Function:handleLogout
  Parameters: event
  Usage:This fxn is used to end user session and redirect the user back to login page
  */
handleLogout(event){
  // console.log("logout event fired",this.props)
  let loginPage =[]
  loginPage.push(<LoginScreen appContext={this.props.appContext}/>)
  this.props.appContext.setState({loginPage:loginPage,uploadScreen:[]})
}
  render() {
    return (
      <div className="App">
        <div onClick={(event) => this.handleDivClick(event)}>
          <center>
          <div>
            You can print upto {this.state.printcount} files at a time since you are {this.state.role}
          </div>
          <Dropzone onDrop={ (files) => this.onDrop(files) }>
          <div>Try dropping some files here, or click to select files to upload.</div>
          </Dropzone>
          <div>
            Files to be printed are:
            { this.state.filesPreview }
          </div>
          </center>
          <div>
            { this.state.printingmessage }
          </div>
          <MuiThemeProvider>
            <RaisedButton disabled={ this.state.printButtonDisabled } label="Print Files" primary= {true} style= {style} onClick= {(event) => this.handleClick(event)}/>
          </MuiThemeProvider>
        </div>
      </div>
    )
  }
}

const style = {
  margin: 15,
}

export default UploadScreen