// import React, { useState } from "react";
// import ChatBot from 'react-simple-chatbot';
// import {Segment} from 'semantic-ui-react';

// function Chat() {
 
//     const steps = [
//         {
//           id: "Greet",
//           message: "Hello, welcome to our website",
//           trigger: "search for partner Agreement",
//         },
//         {
//           id: "search for partner Agreement",
//           message: 'Type "search for partner Agreement"',
//           trigger: "the url",
//         },
//         {
//           id: "the url",
//           user: true,
//           trigger: "output",
//         },
//         {
//           id: "output",
//           message:
//             "Business partnerships provide opportunities for owners to share responsibilities and unique contributions to help an organization grow",
//           end: true,
//         },
//       ];
      
//   return (
//    <>
//    <Segment floated="right">
//     <ChatBot steps={steps}/>
//    </Segment>
   
//    </>
//   );
// }

// export default Chat;


// import React, { useState } from 'react';
// import axios from 'axios';
// import './chat.css'; // Import your CSS file
// import {Segment} from 'semantic-ui-react';

// function Chat() {
//   const [userQuestion, setUserQuestion] = useState('');
//   const [response, setResponse] = useState(null);

//   const handleUserQuestionChange = (event) => {
//     setUserQuestion(event.target.value);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
    
//     try {
//       const apiUrl = 'http://127.0.0.1:5000/handle_userinput';
//       const response = await axios.post(apiUrl, { user_question: userQuestion });
//       setResponse(response.data);
//     } catch (error) {
//       console.error('Error:', error);
//       setResponse({ error: 'An error occurred while fetching data from the server.' });
//     }
//   };

//   return (
//     <Segment floated="right">
//     <div className="App">
//       {/* <h1>PDF Data API</h1> */}
//       <form onSubmit={handleSubmit}>
//         <label>
//           Enter your question:
//           <input
//             type="text"
//             value={userQuestion}
//             onChange={handleUserQuestionChange}
//           />
//         </label>
//         <button type="submit">Submit</button>
//       </form>

//       {response && (
//         <div className="response">
//           <h2>API Response</h2>
//           <p><strong>Answer:</strong> {response.answer}</p>
//           <p><strong>Source Document:</strong> {response.source_document}</p>
//         </div>
//       )}

//       {response && response.error && (
//         <div className="error">
//           <p>{response.error}</p>
//         </div>
//       )}
//     </div>
//      </Segment>

//   );
// }

// export default Chat;


// src/components/Chatbot.js
// src/components/Chatbot.js
import React, { useState } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    // Show the loader
    setIsLoading(true);

    // Send the user's message to the API
    try {
      const response = await axios.post('http://127.0.0.1:5000/handle_userinput', {
        user_question: input,
      });

      // Extract the answer and source documents from the API response
      const { answer, source_document } = response.data;

      // Add the user's question, answer, and source documents to the chat
      setMessages([
        ...messages,
        { text: input, sender: 'user' },
        { text: answer, sender: 'bot' },
        // { text: source_document, sender: 'bot' },
      ]);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      // Hide the loader
      setIsLoading(false);
    }
  };

  const handleInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      // Prevent the default form submission behavior
      event.preventDefault();
      
      // Trigger the send message function when Enter is pressed
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a question"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          Send
          {isLoading && <div className="loader"></div>}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;


