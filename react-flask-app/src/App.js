import React, { useState } from 'react';
import InputForm from './InputForm';
import ShowResponse from './ShowResponse';
import {BrowserRouter, Routes , Route} from 'react-router-dom';

function App() {
 
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element= {<InputForm/>} />
          <Route path="/:data" element={<ShowResponse/>} />
        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;