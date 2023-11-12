import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./ShowResponse.css"

function InputForm() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  function handleUrlChange(event) {
    setUrl(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    },[]);
    const data = await response.json();
    console.log(data);

    navigate(`/${data['data']}`);
  }

  return (
    <div className="dashboard">
      <div class="profile">
        <h2>HTTP Request-Response Analyser!</h2>
        <p>Insert your URL below and I show you all the details about that </p>
        <h1>&#128526;</h1>
        <form onSubmit={handleSubmit}>
        <label>
          <input className= "url_input" type="url" placeholder="Enter URL..." value={url} onChange={handleUrlChange} required />
        </label>
        <button className= "url_button" type="submit">Submit</button>
      </form>
      </div>
      
    </div>
  );
}

export default InputForm;