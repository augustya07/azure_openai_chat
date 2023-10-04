import React from "react";
import "./App.css";
import Contents from "./components/component1";
import Table from "./components/component2";
import Chat from "./components/chatbox";

function App() {
  return (
    <div className="App">
    
      <div className="content-container">
        <Contents className="tab1" />
        <Table className="tab2" />
        <Chat className="chatbox" />
      </div>
    </div>
  );
}

export default App;
